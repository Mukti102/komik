"use client";
import { useState, useRef, forwardRef, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import Halaman from "./components/halaman";
import choiceData from "./data";

export default function Home() {
  const [step, setStep] = useState("cover");
  const [nama, setNama] = useState("");
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const bookRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startAdventure = () => {
    setStep("comic");
    setIsActive(true); // Mulai timer saat masuk ke komik
  };

  const totalHalaman = 70;

  const saveScore = async () => {
    setIsActive(false); // Hentikan timer saat selesai
    setLoading(true);
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Kirim 'waktu' ke database
        body: JSON.stringify({ nama, skor: score, duration: seconds }),
      });
      fetchLeaderboard();
      setStep("leaderboard");
      alert("Berhasil Menyimpan!");
    } catch (err) {
      console.error("Gagal simpan skor:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setLeaderboard(data);
      console.log(data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  const downloadCSV = () => {
    if (leaderboard.length === 0) return alert("Data kosong!");

    const headers = [
      "Peringkat",
      "Nama",
      "Skor",
      "Durasi (Detik)",
      "Waktu Format",
    ];
    const rows = leaderboard.map((item, index) => [
      index + 1,
      item.nama,
      item.skor,
      item.duration,
      formatTime(item.duration),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Laporan_Misi_Makan_Sehat_${new Date().toLocaleDateString()}.csv`,
    );
    link.click();
  };

  const resetDatabase = async () => {
    if (
      !confirm(
        "APAKAH ANDA YAKIN? Semua data leaderboard akan DIHAPUS PERMANEN untuk sesi baru.",
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch("/api/leaderboard", { method: "DELETE" });
      if (res.ok) {
        setLeaderboard([]);
        alert("Leaderboard telah dibersihkan! Siap untuk sesi baru.");
      }
    } catch (err) {
      alert("Gagal mereset data");
    } finally {
      setLoading(false);
    }
  };

  const jumpTo = (pageNum) => {
    if (bookRef.current) {
      const flipBook = bookRef.current.pageFlip();
      // turnToPage biasanya lebih stabil untuk lompatan jauh
      flipBook.turnToPage(pageNum - 1);
      setCurrentPage(pageNum);
    }
  };

  const handleChoice = (points, next) => {
    setScore((prev) => prev + points);
    setTimeout(() => {
      jumpTo(next);
    }, 500);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-[#FFF9F0] font-sans text-zinc-800  select-none overflow-hidden">
      {/* --- FLOATING STATUS (TOP) --- */}
      {step === "comic" && (
        <div className="w-full px-6 pt-6 pb-2 flex justify-between items-center z-50">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-[#FFD93D] flex items-center gap-2">
            <span className="text-xl">👤</span>
            <span className="font-black text-sm text-zinc-600 truncate max-w-[80px]">
              {nama}
            </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-indigo-400 flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            <span className="font-mono font-black text-indigo-600">
              {formatTime(seconds)}
            </span>
          </div>
          <div className="bg-[#FF8B8B] px-5 py-2 rounded-2xl shadow-lg border-2 border-white flex items-center gap-2 animate-bounce-short">
            <span className="text-white font-black text-lg">{score}</span>
            <span className="text-white/80 text-[10px] font-bold uppercase">
              Points
            </span>
          </div>
        </div>
      )}

      {/* 1. COVER (SUPER CUTE) */}
      {step === "cover" && (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="text-[120px] relative drop-shadow-xl leading-none">
              🍱
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2 text-[#4D4D4D] leading-none uppercase italic">
            Misi <br />{" "}
            <span className="text-[#FF6B6B] text-5xl">Makan Sehat</span>
          </h1>
          <p className="text-zinc-400 font-bold mb-10 text-sm tracking-wide">
            Petualangan nutrisi yang seru!
          </p>
          <button
            onClick={() => setStep("input")}
            className="group relative bg-[#6BCB77] hover:bg-[#59b865] text-white px-12 py-5 rounded-[2.5rem] font-black text-xl shadow-[0_8px_0_#48a353] transition-all active:translate-y-1 active:shadow-none"
          >
            MULAI SEKARANG!
          </button>
        </div>
      )}

      {/* 2. INPUT NAMA */}
      {step === "input" && (
        <div className="flex flex-col items-center justify-center h-full w-full px-10">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl w-full border-4 border-[#FFD93D] relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl bg-white rounded-full p-2 shadow-md">
              👋
            </div>
            <h2 className="text-2xl font-black mb-6 mt-4 text-center">
              Kenalan Yuk!
            </h2>
            <input
              type="text"
              className="w-full p-5 bg-[#FDFCF0] border-3 border-zinc-100 rounded-[2rem] mb-6 text-center text-xl font-black text-indigo-500 placeholder:text-zinc-300 outline-none focus:border-indigo-300 transition-all"
              placeholder="Nama Kamu..."
              onChange={(e) => setNama(e.target.value)}
            />
            <button
              // disabled={!nama}
              // onClick={() => setStep("comic")}
              disabled={!nama}
              onClick={startAdventure}
              className="w-full bg-[#4D96FF] text-white py-5 rounded-[2rem] font-black text-lg shadow-[0_6px_0_#3678db] disabled:opacity-30 disabled:shadow-none transition-all active:translate-y-1 active:shadow-none"
            >
              GASSS! 🚀
            </button>
          </div>
        </div>
      )}

      {/* 3. MODE KOMIK (STRETCHED FOR MOBILE) */}
      {step === "comic" && (
        <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 p-0">
          {/* AREA BUKU - Disesuaikan agar pas di layar HP */}
          <div className="w-full flex-1  h-[70vh] md:h-[60vh] flex items-center justify-center">
            <HTMLFlipBook
              width={300}
              height={450}
              size="stretch"
              minWidth={280}
              maxWidth={500}
              minHeight={400}
              usePortrait={true}
              maxHeight={700}
              showCover={true}
              onFlip={(e) => {
                const newPage = e.data + 1;
                setCurrentPage(newPage);
              }}
              // Tambahkan ini untuk mencegah user klik area buku untuk pindah halaman
              clickEventForward={false}
              ref={bookRef}
              className="comic-book shadow-2xl"
              mobileScrollSupport={true}
            >
              {[...Array(totalHalaman)].map((_, i) => (
                <Halaman key={i + 1} number={i} />
              ))}
            </HTMLFlipBook>
          </div>
          {/* --- INTERACTIVE DECK (BOTTOM) --- */}
          <div className="w-full max-w-[600px] z-10 px-2">
            {choiceData[currentPage] ? (
              <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border-t-4 border-zinc-50 flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300">
                <div className="text-center font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-1">
                  Pilih Salah Satu
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() =>
                      handleChoice(
                        choiceData[currentPage].a.p,
                        choiceData[currentPage].a.page,
                      )
                    }
                    className="flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-[#F0F7FF] border-2 border-[#D6E9FF] rounded-3xl hover:border-indigo-400 active:scale-95 transition-all group"
                  >
                    <div className="md:w-10 md:h-10 w-8 h-8 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black shadow-md shadow-indigo-200">
                      A
                    </div>
                    <span className="flex-1 text-left font-bold text-zinc-700 text-[10px] md:text-sm leading-tight">
                      {choiceData[currentPage].a.text}
                    </span>
                    {/* <span className="text-indigo-400 font-black text-xs">
                      +{choiceData[currentPage].a.p}
                    </span> */}
                  </button>

                  <button
                    onClick={() =>
                      handleChoice(
                        choiceData[currentPage].b.p,
                        choiceData[currentPage].b.page,
                      )
                    }
                    className="flex items-center gap-3 md:gap-4 p-3 bg-[#F0FFF4] border-2 border-[#D6FFE0] rounded-3xl hover:border-emerald-400 active:scale-95 transition-all group"
                  >
                    <div className="md:w-10 md:h-10 w-8 h-8  rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-200">
                      B
                    </div>
                    <span className="flex-1 text-left font-bold text-zinc-700 text-sm leading-tight text-[10px] md:text-sm">
                      {choiceData[currentPage].b.text}
                    </span>
                    {/* <span className="text-emerald-400 font-black text-xs">
                      +{choiceData[currentPage].b.p}
                    </span> */}
                  </button>
                </div>
              </div>
            ) : (
              <div className=" flex items-center justify-center">
                {currentPage === totalHalaman && (
                  <button
                    onClick={saveScore}
                    className="w-full bg-[#FF6B6B] text-white py-4 rounded-2xl font-black text-lg shadow-[0_5px_0_#d95252] active:translate-y-1 active:shadow-none"
                  >
                    {loading ? "MENYIMPAN..." : "🏁 SELESAI & SIMPAN"}!
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {step === "leaderboard" && (
        <div className="flex flex-col items-center justify-center h-full w-full px-8 animate-in zoom-in duration-500">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border-4 border-[#FFD93D] flex flex-col max-h-[80vh]">
            <div className="p-6 bg-[#FFD93D] text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                🏆 10 Terbaik 🏆
              </h2>
            </div>

            <div className="bg-zinc-100 p-3 flex gap-2 border-b border-zinc-200">
              <button
                onClick={downloadCSV}
                className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-[10px] font-black uppercase"
              >
                📥 Download Data
              </button>
              <button
                onClick={resetDatabase}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl text-[10px] font-black uppercase"
              >
                🗑️ Reset Leaderboard
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {leaderboard.map((item, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-4 rounded-2xl border-2 ${
                    i === 0
                      ? "bg-yellow-50 border-yellow-200 animate-pulse"
                      : "bg-zinc-50 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        i === 0
                          ? "bg-yellow-400 text-white"
                          : "bg-zinc-200 text-zinc-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-700 capitalize leading-tight">
                        {item.nama}
                      </span>
                      {/* MENAMPILKAN DURASI */}
                      <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                        ⏱️ {formatTime(item.duration || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-[#4D96FF] text-lg block leading-none">
                      {item.skor}
                    </span>
                    <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">
                      Pts
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-zinc-100">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-zinc-800 text-white rounded-[1.5rem] font-black text-sm uppercase transition-transform active:scale-95"
              >
                Main Lagi 🔄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS KHUSUS ANIMASI */}
      <style jsx global>{`
        @keyframes bounce-short {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .animate-bounce-short {
          animation: bounce-short 2s ease-in-out infinite;
        }
        .comic-book {
          background: white;
        }
      `}</style>
    </div>
  );
}
