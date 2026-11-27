import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

const MODEL_NAME = 'gemini-4-hydrogen';

const BASE_SYSTEM_INSTRUCTION = `Kamu adalah Senior Cruise Training Officer berpengalaman lebih dari 15 tahun di industri kapal pesiar internasional (Hotel, F&B, Deck, Engine, Safety, Entertainment). Kamu melatih calon kru asal Indonesia. Jelaskan dengan bahasa Indonesia yang jelas, praktis, runtut, dan memotivasi. Gunakan contoh situasi nyata di kapal. Untuk topik keselamatan, selalu merujuk pada standar umum industri (SOLAS, STCW, ISM Code, MLC 2006, HACCP/USPH untuk sanitasi) tanpa mengarang pasal atau nomor regulasi. Jika tidak yakin, katakan bahwa prosedur final mengikuti kebijakan perusahaan pelayaran (cruise line) masing-masing. Jangan memberikan informasi palsu soal gaji, lowongan, atau jaminan kerja. Jangan menyebut aturan internal spesifik dari perusahaan tertentu sebagai fakta.`;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY belum tersedia di lingkungan server. Pastikan secret GEMINI_API_KEY aktif.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getProfileContext(profile?: {
  name?: string;
  experienceLevel?: string;
}): string {
  if (!profile) return '';
  const levelDesc =
    profile.experienceLevel === 'berpengalaman'
      ? 'Sudah pernah bekerja di kapal pesiar (fokus pada ketajaman SOP lanjutan, supervisi, audit, dan situasi kompleks).'
      : profile.experienceLevel === 'hospitality'
        ? 'Pernah bekerja di hotel/restoran darat (fokus pada adaptasi dari standar darat ke regulasi maritim & operasional kapal pesiar).'
        : 'Pemula (jelaskan istilah kapal dari dasar secara ramah, langkah demi langkah, dan mudah dicerna).';
  return `\n\nKonteks Peserta:\n- Nama panggilan: ${profile.name || 'Calon Kru'}\n- Level pengalaman: ${levelDesc}`;
}

function buildErrorMessage(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('API_KEY') || raw.includes('403') || raw.includes('PERMISSION_DENIED')) {
    return {
      status: 503,
      message:
        'Layanan AI belum dapat terhubung karena konfigurasi kunci API. Silakan periksa Settings > Secrets atau coba beberapa saat lagi.',
    };
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message:
        'Permintaan AI sedang padat atau batas kuota sementara tercapai. Tunggu sejenak lalu tekan Coba Lagi.',
    };
  }
  return {
    status: 500,
    message:
      'Maaf, terjadi gangguan saat menghubungi Senior AI. Silakan tekan "Coba Lagi" dalam beberapa detik.',
  };
}

function safeParseJson<T>(rawText: string | undefined): T {
  const cleaned = (rawText || '').trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned) as T;
}

// 1. Generate Division Work Guide (Pedoman Kerja)
app.post('/api/ai/guide', async (req: Request, res: Response) => {
  try {
    const { divisionName, roles, description, profile } = req.body;
    const ai = getAiClient();

    const prompt = `Buatkan Pedoman Kerja lengkap untuk divisi kapal pesiar: "${divisionName}".
Posisi yang tercakup: ${(roles || []).join(', ')}.
Gambaran divisi: ${description || ''}.

Pastikan konten:
- Praktis, realistis di lingkungan kapal pesiar internasional.
- Menggunakan Bahasa Indonesia natural dengan istilah industri tetap dalam Bahasa Inggris (misalnya Muster Drill, Galley, Housekeeping, Guest Service, Turnaround Day, USPH).
- Mencakup ringkasan tugas harian (6-8 poin), struktur posisi & jenjang karier (4-5 tingkat), standar penampilan & perilaku (5-6 poin), SOP inti langkah demi langkah (3-4 SOP utama, tiap SOP 4-6 langkah konkret), kesalahan umum yang harus dihindari (4-5 item), dan glosarium istilah penting divisi ini (6-8 istilah).
- Jangan menyebut aturan internal perusahaan tertentu sebagai fakta dan jangan memberi klaim gaji.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + getProfileContext(profile),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            dailyTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            careerPath: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  position: { type: Type.STRING },
                  level: { type: Type.STRING },
                  responsibility: { type: Type.STRING },
                },
                required: ['position', 'level', 'responsibility'],
              },
            },
            groomingAndBehavior: { type: Type.ARRAY, items: { type: Type.STRING } },
            coreSops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'steps'],
              },
            },
            commonMistakes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mistake: { type: Type.STRING },
                  howToAvoid: { type: Type.STRING },
                },
                required: ['mistake', 'howToAvoid'],
              },
            },
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                },
                required: ['term', 'meaning'],
              },
            },
          },
          required: [
            'overview',
            'dailyTasks',
            'careerPath',
            'groomingAndBehavior',
            'coreSops',
            'commonMistakes',
            'glossary',
          ],
        },
      },
    });

    const data = safeParseJson(response.text);
    res.json(data);
  } catch (err) {
    console.error('Guide generation error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// 2. Generate Training Module Content (Pelatihan Learning Path)
app.post('/api/ai/module', async (req: Request, res: Response) => {
  try {
    const { divisionName, moduleTitle, moduleLevel, moduleSummary, profile } = req.body;
    const ai = getAiClient();

    const prompt = `Buatkan materi pelatihan mendalam dan terstruktur untuk modul berikut:
- Divisi: ${divisionName}
- Level: ${moduleLevel}
- Judul Modul: ${moduleTitle}
- Cakupan: ${moduleSummary}

Susun materi agar enak dibaca di HP maupun desktop:
- 3-4 tujuan belajar yang terukur.
- 3-4 sub-bagian penjelasan materi (masing-masing punya judul jelas, penjelasan praktis 2-3 paragraf ringkas, dan 1 aksi kunci/keyAction yang langsung bisa diterapkan di kapal).
- 1 contoh situasi nyata di kapal (judul, gambaran situasi, dan cara penanganan terbaik).
- 3-4 tips langsung dari "Senior" yang memotivasi dan berdasarkan realita kerja di laut.
- 4-5 ringkasan poin kunci.
Tetap gunakan Bahasa Indonesia natural dengan istilah maritim/hospitality dalam Bahasa Inggris.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + getProfileContext(profile),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  keyAction: { type: Type.STRING },
                },
                required: ['heading', 'explanation', 'keyAction'],
              },
            },
            realShipScenario: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                situation: { type: Type.STRING },
                bestResponse: { type: Type.STRING },
              },
              required: ['title', 'situation', 'bestResponse'],
            },
            seniorTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'learningObjectives',
            'sections',
            'realShipScenario',
            'seniorTips',
            'keyTakeaways',
          ],
        },
      },
    });

    const data = safeParseJson(response.text);
    res.json(data);
  } catch (err) {
    console.error('Module generation error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// 3. Generate Quiz or 20-Question Final Exam
app.post('/api/ai/quiz', async (req: Request, res: Response) => {
  try {
    const { divisionName, moduleTitle, moduleTitles, questionCount = 6, isFinalExam = false, profile } = req.body;
    const count = isFinalExam ? 20 : Math.min(Math.max(Number(questionCount) || 6, 5), 10);
    const ai = getAiClient();

    const scopeText = isFinalExam
      ? `Ujian Akhir Divisi "${divisionName}" yang mencakup campuran seluruh topik modul berikut: ${(moduleTitles || []).join('; ')}.`
      : `Kuis Modul "${moduleTitle}" pada divisi "${divisionName}".`;

    const prompt = `Buatkan tepat ${count} soal pilihan ganda berkualitas tinggi untuk ${scopeText}
Aturan soal:
- Fokus pada studi kasus nyata di kapal pesiar, SOP, keselamatan (SOLAS/STCW/ISM/USPH/MLC 2006 secara umum tanpa mengarang nomor pasal), dan pelayanan tamu.
- Setiap soal WAJIB memiliki tepat 4 opsi jawaban yang masuk akal (options array panjang 4).
- correctIndex adalah angka integer 0, 1, 2, atau 3 yang menunjuk jawaban benar (variasikan posisi jawaban benar secara acak).
- explanation menjelaskan secara ringkas mengapa jawaban tersebut benar dan apa prinsip kerjanya di kapal.
- Bahasa Indonesia natural dengan istilah industri tetap dalam Bahasa Inggris.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + getProfileContext(profile),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const data = safeParseJson<{ questions: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }> }>(response.text);
    const normalized = (data.questions || []).map((q, idx) => ({
      id: `q-${idx + 1}`,
      question: q.question,
      options: q.options.slice(0, 4),
      correctIndex: Math.min(Math.max(Number(q.correctIndex) || 0, 0), 3),
      explanation: q.explanation,
    }));
    res.json({ questions: normalized });
  } catch (err) {
    console.error('Quiz generation error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// 4. Role-Play Conversation Turn
app.post('/api/ai/roleplay/turn', async (req: Request, res: Response) => {
  try {
    const {
      divisionName,
      scenarioTitle,
      scenarioDescription,
      counterpartRole,
      difficulty,
      language,
      history,
      profile,
    } = req.body;
    const ai = getAiClient();

    const roleLabel =
      counterpartRole === 'supervisor'
        ? 'Supervisor / Manager Kapal Pesiar'
        : counterpartRole === 'interviewer'
          ? 'Interviewer / Recruiter Kapal Pesiar'
          : 'Tamu Kapal Pesiar Internasional';

    const difficultyNote =
      difficulty === 'sulit'
        ? 'Bersikap cukup menuntut, kritis, atau emosional (namun tetap sopan/realistis) untuk menguji ketenangan dan solusi kru.'
        : difficulty === 'sedang'
          ? 'Bersikap realistis dengan sedikit keraguan atau pertanyaan lanjutan agar kru benar-benar menjelaskan solusinya.'
          : 'Bersikap ramah dan kooperatif, cocok untuk latihan dasar kepercayaan diri.';

    const langNote =
      language === 'en'
        ? 'Berperanlah dan balas SEPENUHNYA dalam Bahasa Inggris yang natural seperti percakapan nyata di kapal pesiar internasional.'
        : 'Berperanlah dan balas dalam Bahasa Indonesia yang natural (boleh selipkan istilah kapal dalam bahasa Inggris).';

    const systemInstruction = `Kamu sedang melakukan simulasi Role-Play pelatihan kapal pesiar untuk divisi "${divisionName}".
Peranmu: ${roleLabel}.
Skenario: ${scenarioTitle} — ${scenarioDescription}.
Tingkat kesulitan: ${difficultyNote}
Bahasa: ${langNote}
Aturan penting:
- Tetap berada dalam karakter (in-character). Jangan keluar karakter atau memberi nilai saat percakapan berlangsung.
- Balas ringkas (2-4 kalimat) dan alami seperti dialog langsung agar peserta bisa menanggapi.
- Nama peserta yang berlatih adalah ${profile?.name || 'Kru'}.`;

    const contents =
      Array.isArray(history) && history.length > 0
        ? history.map((m: { role: string; text: string }) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          }))
        : [
            {
              role: 'user',
              parts: [
                {
                  text:
                    language === 'en'
                      ? 'Start the role-play scenario now with your opening line in character.'
                      : 'Mulai skenario role-play sekarang dengan kalimat pembuka sesuai karaktermu.',
                },
              ],
            },
          ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    res.json({ reply: (response.text || '').trim() });
  } catch (err) {
    console.error('Roleplay turn error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// 5. Role-Play Evaluation
app.post('/api/ai/roleplay/evaluate', async (req: Request, res: Response) => {
  try {
    const {
      divisionName,
      scenarioTitle,
      counterpartRole,
      difficulty,
      language,
      history,
      profile,
    } = req.body;
    const ai = getAiClient();

    const transcript = (history || [])
      .map((m: { role: string; text: string }) => `${m.role === 'user' ? 'PESERTA (KRU)' : 'LAWAN BICARA (AI)'}: ${m.text}`)
      .join('\n');

    const prompt = `Nilai performa peserta dalam simulasi Role-Play kapal pesiar berikut ini.
- Divisi: ${divisionName}
- Skenario: ${scenarioTitle}
- Lawan bicara: ${counterpartRole}
- Tingkat kesulitan: ${difficulty}
- Bahasa latihan: ${language === 'en' ? 'English Practice' : 'Bahasa Indonesia'}

Transkrip percakapan:
${transcript}

Berikan evaluasi jujur, konstruktif, dan memotivasi dalam Bahasa Indonesia (contoh jawaban yang lebih baik gunakan bahasa sesuai bahasa latihan "${language === 'en' ? 'English' : 'Bahasa Indonesia'}"):
- score: nilai 0-100 secara objektif berdasarkan empati, ketepatan SOP, kesopanan, dan solusi.
- summary: ringkasan singkat performa 2-3 kalimat.
- strengths: 2-4 poin kelebihan peserta.
- weaknesses: 2-4 poin area yang perlu diperbaiki.
- betterResponses: 2-3 contoh kalimat jawaban yang lebih profesional untuk momen penting dalam percakapan tersebut.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + getProfileContext(profile),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            betterResponses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  situation: { type: Type.STRING },
                  suggestedReply: { type: Type.STRING },
                },
                required: ['situation', 'suggestedReply'],
              },
            },
          },
          required: ['score', 'summary', 'strengths', 'weaknesses', 'betterResponses'],
        },
      },
    });

    const data = safeParseJson(response.text);
    res.json(data);
  } catch (err) {
    console.error('Roleplay evaluate error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// 6. Tanya Senior AI (Free Chat with Markdown)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { history, message, profile } = req.body;
    const ai = getAiClient();

    const contents = [
      ...(history || []).slice(-12).map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction:
          BASE_SYSTEM_INSTRUCTION +
          getProfileContext(profile) +
          '\n\nGunakan format Markdown yang rapi (heading kecil, poin-poin, dan cetak tebal untuk istilah penting) agar mudah dibaca di layar HP dan desktop.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    res.json({ reply: (response.text || '').trim() });
  } catch (err) {
    console.error('Senior chat error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// 7. Checklist Generator
app.post('/api/ai/checklist', async (req: Request, res: Response) => {
  try {
    const { divisionName, situation, profile } = req.body;
    const ai = getAiClient();

    const prompt = `Buatkan checklist persiapan interaktif yang sangat praktis untuk kru kapal pesiar asal Indonesia:
- Divisi: ${divisionName}
- Situasi: ${situation}

Aturan:
- Buat 3-4 kategori yang logis (misalnya Dokumen & Administrasi, Kesiapan Fisik & Perlengkapan, Mental & Teknis Divisi, Keselamatan).
- Tiap kategori memiliki 4-5 item konkret yang bisa langsung dicentang, lengkap dengan catatan singkat (note) 1 kalimat mengapa itu penting.
- Jangan mengarang syarat spesifik perusahaan tertentu; ingatkan bila ada item yang tergantung kebijakan cruise line.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + getProfileContext(profile),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        note: { type: Type.STRING },
                      },
                      required: ['text', 'note'],
                    },
                  },
                },
                required: ['category', 'items'],
              },
            },
          },
          required: ['title', 'categories'],
        },
      },
    });

    const data = safeParseJson(response.text);
    res.json(data);
  } catch (err) {
    console.error('Checklist generation error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// 8. Job Interview Simulator — Generate Questions Sequence (6 questions)
app.post('/api/ai/interview/start', async (req: Request, res: Response) => {
  try {
    const { divisionName, roles, language, profile } = req.body;
    const ai = getAiClient();

    const langRule =
      language === 'en'
        ? 'Tuliskan setiap pertanyaan wawancara dalam Bahasa Inggris profesional seperti recruiter internasional, namun tuliskan tips singkat (tip) dalam Bahasa Indonesia agar calon kru terbantu.'
        : 'Tuliskan pertanyaan wawancara dan tips singkat dalam Bahasa Indonesia yang profesional dengan istilah industri tetap dalam Bahasa Inggris.';

    const prompt = `Kamu berperan sebagai Recruiter Kapal Pesiar Internasional untuk divisi "${divisionName}" (posisi: ${(roles || []).join(', ')}).
Buatkan 6 pertanyaan wawancara kerja yang runtut dan realistis untuk kandidat kru asal Indonesia:
1. Perkenalan diri & motivasi kerja di kapal pesiar
2. Pengetahuan teknis / SOP inti divisi
3. Situasi sulit / penanganan komplain atau tekanan kerja
4. Keselamatan & sanitasi di kapal
5. Kerja tim multikultural & kehidupan kontrak panjang di laut
6. Komitmen & pertanyaan penutup profesional

${langRule}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + getProfileContext(profile),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  tip: { type: Type.STRING },
                },
                required: ['question', 'tip'],
              },
            },
          },
          required: ['greeting', 'questions'],
        },
      },
    });

    const data = safeParseJson(response.text);
    res.json(data);
  } catch (err) {
    console.error('Interview start error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// 9. Job Interview Simulator — Evaluate Complete Interview
app.post('/api/ai/interview/evaluate', async (req: Request, res: Response) => {
  try {
    const { divisionName, language, turns, profile } = req.body;
    const ai = getAiClient();

    const qaText = (turns || [])
      .map(
        (t: { questionNumber: number; question: string; userAnswer?: string }) =>
          `Q${t.questionNumber}: ${t.question}\nJawaban Kandidat: ${t.userAnswer || '(tidak dijawab)'}`
      )
      .join('\n\n');

    const prompt = `Evaluasi hasil simulasi wawancara kerja kapal pesiar berikut untuk divisi "${divisionName}" (mode bahasa: ${language === 'en' ? 'English' : 'Bahasa Indonesia'}).

Transkrip Wawancara:
${qaText}

Berikan penilaian jujur, terukur, dan memotivasi dalam Bahasa Indonesia (untuk sampleAnswers gunakan bahasa sesuai mode bahasa wawancara):
- overallScore (0-100)
- communicationScore (0-100)
- technicalScore (0-100)
- serviceMindsetScore (0-100)
- verdict: kesimpulan kesiapan wawancara 2-3 kalimat (jangan menjanjikan lulus seleksi nyata)
- strengths: 3 poin kekuatan kandidat
- improvements: 3 poin spesifik untuk ditingkatkan
- sampleAnswers: 3 contoh jawaban ideal untuk pertanyaan yang paling krusial dari wawancara tadi.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + getProfileContext(profile),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            communicationScore: { type: Type.INTEGER },
            technicalScore: { type: Type.INTEGER },
            serviceMindsetScore: { type: Type.INTEGER },
            verdict: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            sampleAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  idealAnswer: { type: Type.STRING },
                },
                required: ['question', 'idealAnswer'],
              },
            },
          },
          required: [
            'overallScore',
            'communicationScore',
            'technicalScore',
            'serviceMindsetScore',
            'verdict',
            'strengths',
            'improvements',
            'sampleAnswers',
          ],
        },
      },
    });

    const data = safeParseJson(response.text);
    res.json(data);
  } catch (err) {
    console.error('Interview evaluation error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// 10. Maritime Glossary Lookup (Kamus Istilah Kapal)
app.post('/api/ai/glossary', async (req: Request, res: Response) => {
  try {
    const { term, profile } = req.body;
    const ai = getAiClient();

    const prompt = `Jelaskan istilah kapal pesiar / maritim berikut ini untuk calon kru Indonesia: "${term}".
Berikan:
- term: penulisan istilah yang benar
- pronunciationHint: panduan pelafalan sederhana untuk penutur Indonesia
- shortDefinition: arti jelas dan akurat dalam Bahasa Indonesia (2-3 kalimat)
- shipContextExample: contoh kalimat atau situasi nyata penggunaan istilah ini di atas kapal
- relatedDivisions: 1-3 nama divisi yang paling sering menggunakannya
- newCrewTip: 1 tips praktis untuk kru baru terkait istilah ini.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + getProfileContext(profile),
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            pronunciationHint: { type: Type.STRING },
            shortDefinition: { type: Type.STRING },
            shipContextExample: { type: Type.STRING },
            relatedDivisions: { type: Type.ARRAY, items: { type: Type.STRING } },
            newCrewTip: { type: Type.STRING },
          },
          required: [
            'term',
            'pronunciationHint',
            'shortDefinition',
            'shipContextExample',
            'relatedDivisions',
            'newCrewTip',
          ],
        },
      },
    });

    const data = safeParseJson(response.text);
    res.json(data);
  } catch (err) {
    console.error('Glossary lookup error:', err);
    const { status, message } = buildErrorMessage(err);
    res.status(status).json({ error: message });
  }
});

// Start server (Vite middleware in dev, static dist in prod)
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const distPath = path.resolve(__dirname, 'dist');
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (process.env.NODE_ENV !== 'development' && fs.existsSync(distPath));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CruiseCrew Academy server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
