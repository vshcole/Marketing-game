// Vercel serverless-прокси: ключ ANTHROPIC_API_KEY хранится только на сервере.
export default async function handler(req,res){
  if(req.method!=="POST")return res.status(405).end();
  try{
    const {prompt}=req.body||{};
    if(!prompt||prompt.length>6000)return res.status(400).json({error:"bad request"});
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
      headers:{"content-type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
      body:JSON.stringify({model:process.env.ANTHROPIC_MODEL||"claude-sonnet-5-5",max_tokens:900,messages:[{role:"user",content:prompt}]})});
    const d=await r.json();const t=(d.content&&d.content[0]&&d.content[0].text)||"";
    const m=t.match(/\{[\s\S]*\}/);if(!m)throw new Error("no json");
    res.status(200).json(JSON.parse(m[0]));
  }catch(e){res.status(502).json({error:"ai unavailable"})}
}
