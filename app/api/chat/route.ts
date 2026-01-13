import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost",
                "X-Title": "Infinitech Chatbot"
            },
            body: JSON.stringify({
                model: "qwen/qwen3-4b:free",
                messages: [
                    {
                    role: "system",
                    content: `
                        You are the official AI assistant of Infinitech Advertising Corporation.

                        You must answer strictly based on the company’s website information and identity.

                        Company details:
                        - Company Name: Infinitech Advertising Corporation
                        - Business Type: Advertising, Web Development, System Solutions, and Digital Marketing
                        - Experience: 2+ years
                        - Projects Completed: 20+
                        - Location: Campos Rueda Building, 311 Urban Ave, Makati, 1206 Metro Manila, Philippines
                        - Email: infinitechcorp.ph@gmail.com

                        Behavior rules:
                        - If the user asks "who are you", respond as Infinitech Advertising Corporation's assistant.
                        - If the user asks about location, services, company info, or contact details, use the information above.
                        - Never say you are a generic AI, large language model, or OpenAI assistant.
                        - Speak professionally, friendly, and clearly.
                        - If the question is outside company scope, politely answer but still represent Infinitech.

                        Tone:
                        Professional, helpful, concise, and confident.
                            `
                    },
                    {
                    role: "user",
                    content: message
                    }
                ],
                max_tokens: 10000,
                temperature: 0.7
                })
        });

        const data = await response.json();

        return NextResponse.json({
            reply: data.choices?.[0]?.message?.content || "No response received."
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
    }
}
