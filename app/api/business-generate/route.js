import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request) {
  try {
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { occupation, target, strengths } = await request.json();

    if (!occupation || !target || !strengths) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prompt = `あなたはビジネスLP（ランディングページ）作成の専門家です。
以下の情報をもとに、魅力的なビジネスLPのコンテンツを生成してください。

【ビジネス情報】
- 職業・業種: ${occupation}
- ターゲット顧客: ${target}
- 強み・特徴: ${strengths}

【出力形式】
以下のJSON形式で出力してください：
{
  "name": "ビジネス名または個人名",
  "title": "キャッチコピー（30文字以内、ターゲットに響く一言）",
  "about": "自己紹介・会社紹介（100-150文字、信頼感を与える内容）",
  "services": "提供サービス（箇条書き3-5項目、各30文字以内）",
  "benefits": "お客様が得られるメリット（箇条書き3-5項目、各30文字以内）",
  "cta": "行動喚起の文言（20文字以内）"
}

【注意事項】
- 日本語で出力してください
- ビジネス向けの専門的かつ親しみやすいトーンで
- 具体的で説得力のある内容にしてください
- JSONのみを出力し、他の説明は不要です`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたはビジネスLP作成の専門家です。魅力的で説得力のあるコンテンツを生成します。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const content = completion.choices[0].message.content;
    
    // JSONを抽出（```json ... ``` で囲まれている場合に対応）
    let jsonContent = content;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const result = JSON.parse(jsonContent);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content', details: error.message },
      { status: 500 }
    );
  }
}
