const FALLBACK = "Abhi thoda busy hoon, thodi der baad try karo 🙏";

async function askBot(persona, messages, botId) {
  try {
    // 1. Pichle 15 messages ko provider ke format me badlo
    const history = messages.slice(-15).map((m) => ({
      role: String(m.senderId) === String(botId) ? "assistant" : "user",
      content: m.text,
    }));
    // zyadatar providers pehla message user ka maangte hain
    while (history.length && history[0].role === "assistant") history.shift();

    // 2. System prompt = persona + fixed rules
    const system =
      persona +
      "\n\nRules: Tum ek AI ho, insaan hone ka dawa mat karo. Reply 3-4 lines se zyada nahi, Hinglish me.";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL,
        messages: [{ role: "system", content: system }, ...history],
        max_tokens: 1000,
      }),
      signal: AbortSignal.timeout(60000), // 20 sec me jawab na aaye to fallback
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 500)}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty reply: " + JSON.stringify(data).slice(0, 500));
    return text;
  } catch (err) {
    console.log("askBot error:", err.message);
    return FALLBACK;
  }
}

module.exports = { askBot };