import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import type { WeatherReading, AlertItem } from "../lib/types";

interface AgentChatProps {
  readings: WeatherReading[];
  alerts: AlertItem[];
}

interface ChatMessage {
  id: number;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
  thinking?: boolean;
}

const QUICK_PROMPTS = [
  "¿Dónde llueve más ahora?",
  "Resumen del clima",
  "¿Qué estación está más fría?",
  "Recomienda riego",
];

function generateAgentResponse(
  message: string,
  readings: WeatherReading[],
  alerts: AlertItem[]
): string {
  const q = message.toLowerCase();

  if (!readings.length) {
    return "Aún no recibo datos de las estaciones. Espera unos segundos e inténtalo de nuevo.";
  }

  if (/(lluv|precip|llovi)/.test(q)) {
    const maxRain = [...readings].sort((a, b) => b.rainfall - a.rainfall)[0];
    if (maxRain.rainfall < 0.5) {
      return `📍 No hay lluvia significativa en este momento. La estación con mayor registro es **${maxRain.stationName}** con apenas ${maxRain.rainfall.toFixed(1)} mm.`;
    }
    return `🌧 La estación con más lluvia ahora es **${maxRain.stationName}** con **${maxRain.rainfall.toFixed(1)} mm** en la última hora.`;
  }

  if (/(fr[ií]o|temp.*baja|menor temp)/.test(q)) {
    const coldest = [...readings].sort((a, b) => a.temperature - b.temperature)[0];
    return `❄ La estación más fría es **${coldest.stationName}** con **${coldest.temperature.toFixed(1)}°C** y humedad de ${coldest.humidity}%.`;
  }

  if (/(calor|caliente|temp.*alta|mayor temp)/.test(q)) {
    const hottest = [...readings].sort((a, b) => b.temperature - a.temperature)[0];
    return `🌞 La estación más cálida es **${hottest.stationName}** con **${hottest.temperature.toFixed(1)}°C**.`;
  }

  if (/(viento|wind)/.test(q)) {
    const windy = [...readings].sort((a, b) => b.windSpeed - a.windSpeed)[0];
    return `🌬 El viento más fuerte se registra en **${windy.stationName}** con **${windy.windSpeed.toFixed(1)} m/s**.`;
  }

  if (/(humedad|humid)/.test(q)) {
    const hum = [...readings].sort((a, b) => b.humidity - a.humidity)[0];
    return `💧 La humedad más alta está en **${hum.stationName}** (${hum.humidity}%). Buen indicador para evaporación reducida.`;
  }

  if (/(rieg|cultiv|agr[oíi])/.test(q)) {
    const dry = readings.filter((r) => r.humidity < 65 && r.rainfall < 0.5);
    if (dry.length === 0) {
      return "💚 Las condiciones de humedad son adecuadas. No es necesario riego adicional en este momento.";
    }
    return `🌱 Recomendaría riego prioritario en: **${dry
      .map((d) => d.stationName)
      .join(", ")}**. Tienen humedad <65% y sin lluvia reciente.`;
  }

  if (/(resumen|general|todo|clima)/.test(q)) {
    const avgT = readings.reduce((a, r) => a + r.temperature, 0) / readings.length;
    const avgH = readings.reduce((a, r) => a + r.humidity, 0) / readings.length;
    const totalR = readings.reduce((a, r) => a + r.rainfall, 0);
    return `📊 Resumen actual del Carchi:\n• Temperatura media: **${avgT.toFixed(1)}°C**\n• Humedad promedio: **${avgH.toFixed(0)}%**\n• Lluvia acumulada: **${totalR.toFixed(1)} mm**\n• Alertas activas: **${alerts.length}**`;
  }

  if (/(alert|aviso|peligro)/.test(q)) {
    if (alerts.length === 0) return "✅ No hay alertas activas. Todo en orden.";
    return `⚠ Hay **${alerts.length}** alerta${alerts.length === 1 ? "" : "s"} activa${alerts.length === 1 ? "" : "s"}. La más reciente: ${alerts[0].stationName} — ${alerts[0].parameterName}.`;
  }

  return `💡 Puedo ayudarte con consultas sobre **temperatura, lluvia, humedad, viento, riego y alertas**. Prueba con: "¿dónde llueve más?" o "resumen del clima".`;
}

function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AgentChat({ readings, alerts }: AgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 0,
      role: "agent",
      text: "👋 Hola, soy tu agente meteorológico. Pregúntame sobre temperaturas, lluvias, riego o cualquier dato del Carchi.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const responseText = generateAgentResponse(trimmed, readings, alerts);
      const agentMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "agent",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((m) => [...m, agentMsg]);
      setThinking(false);
      inputRef.current?.focus();
    }, 650 + Math.random() * 400);
  }

  return (
    <div className="flex flex-col h-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
        aria-live="polite"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "agent" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shrink-0 self-end">
                <Bot size={15} aria-hidden />
              </div>
            )}
            <div
              className={`
                max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug
                animate-[fadeIn_.25s_ease-out]
                ${msg.role === "user"
                  ? "bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-br-md"
                  : "bg-white/[0.06] border border-white/10 text-slate-100 rounded-bl-md"
                }
              `}
            >
              <div className="whitespace-pre-wrap">{renderMarkdown(msg.text)}</div>
              <div
                className={`text-[10px] mt-1 ${msg.role === "user" ? "text-sky-100" : "text-slate-400"}`}
              >
                {msg.timestamp.toLocaleTimeString("es-EC", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 border border-white/10 flex items-center justify-center shrink-0 self-end">
                <User size={15} aria-hidden className="text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {thinking && (
          <div className="flex gap-2 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shrink-0">
              <Bot size={15} aria-hidden />
            </div>
            <div className="bg-white/[0.06] border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-[fadeIn_.4s_ease-in-out_infinite_alternate]" />
              <span
                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-[fadeIn_.4s_ease-in-out_infinite_alternate]"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-[fadeIn_.4s_ease-in-out_infinite_alternate]"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => sendMessage(p)}
            disabled={thinking}
            className="
              shrink-0 text-[11px] px-2.5 py-1 rounded-full
              bg-white/[0.06] hover:bg-white/[0.12] border border-white/10
              text-slate-200 transition disabled:opacity-40
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
            "
          >
            <Sparkles size={10} className="inline mr-1 text-amber-300" aria-hidden />
            {p}
          </button>
        ))}
      </div>

      <form
        className="p-3 border-t border-white/10 bg-slate-950/40 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntale al agente…"
          aria-label="Mensaje al agente"
          disabled={thinking}
          className="
            flex-1 px-3.5 py-2.5 text-sm
            bg-white/[0.06] border border-white/15
            rounded-xl text-slate-100 placeholder-slate-400
            focus:outline-none focus:border-indigo-400 focus:bg-white/[0.1]
            disabled:opacity-50 transition
          "
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          aria-label="Enviar mensaje"
          className="
            shrink-0 w-10 h-10 rounded-xl
            bg-gradient-to-br from-indigo-500 to-fuchsia-500
            text-white disabled:opacity-40 disabled:cursor-not-allowed
            hover:scale-105 active:scale-95
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
            transition flex items-center justify-center
          "
        >
          <Send size={16} aria-hidden />
        </button>
      </form>
    </div>
  );
}
