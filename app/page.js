"use client";
import { useState, useRef, useEffect } from "react";
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
  const interactiveRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const totalHalaman = 70;
  const finishPages = [63, 67, 72];
  const finishPagesDekstop = [62, 66];
  const [postFinish, setPostFinish] = useState(null);

  const isFinishPageMobile = finishPages.includes(currentPage);

  useEffect(() => {
    console.log("DEBUG");
    console.log("currentPage:", currentPage, typeof currentPage);
    console.log("finishPages:", finishPagesDekstop);
    console.log("includes:", finishPagesDekstop.includes(currentPage));
  }, [currentPage]);

  const isFinishPageDesktop =
    finishPagesDekstop.includes(currentPage) ||
    finishPagesDekstop.includes(currentPage + 1);

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
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
    setIsActive(true);
  };

  const saveScore = async () => {
    setIsActive(false);
    setLoading(true);
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, skor: score, duration: seconds }),
      });
      fetchLeaderboard();
      const page = currentPage;
      let post = null;
      if ([62, 63].includes(page)) post = "A";
      else if ([66, 67].includes(page)) post = "B";
      else if ([69, 70].includes(page)) post = "C";
      if (post) {
        setPostFinish(post);
        setStep("postFinish");
      } else {
        setStep("leaderboard");
      }
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
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  const downloadCSV = () => {
    if (leaderboard.length === 0) return alert("Data kosong!");
    const headers = ["Peringkat", "Nama", "Skor", "Durasi (Detik)", "Waktu Format"];
    const rows = leaderboard.map((item, index) => [
      index + 1, item.nama, item.skor, item.duration, formatTime(item.duration),
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Misi_Makan_Sehat_${new Date().toLocaleDateString()}.csv`);
    link.click();
  };

  const resetDatabase = async () => {
    if (!confirm("APAKAH ANDA YAKIN? Semua data leaderboard akan DIHAPUS PERMANEN untuk sesi baru.")) return;
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
      flipBook.turnToPage(pageNum - 1);
      setCurrentPage(pageNum);
    }
  };

  const hasActiveData = choiceData[currentPage] || choiceData[currentPage + 1];

  useEffect(() => {
    if (step === "comic" && choiceData[currentPage]) {
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }), 300);
    } else if (hasActiveData && interactiveRef.current) {
      setTimeout(() => interactiveRef.current.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
    } else {
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 300);
    }
  }, [currentPage, step]);

  const handleChoice = (points, next) => {
    setScore((prev) => prev + points);
    setTimeout(() => jumpTo(next), 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 select-none">

      {/* HUD — hanya muncul saat mode komik */}
      {step === "comic" && (
        <div className="w-full px-4 pt-4 pb-2 flex justify-between items-center gap-2 bg-slate-900 z-50">
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-slate-400 text-xs">👤</span>
            <span className="font-semibold text-xs text-slate-200 truncate max-w-[72px]">{nama}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-cyan-400 text-xs">⏱</span>
            <span className="font-mono font-bold text-xs text-cyan-400">{formatTime(seconds)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-orange-400 text-xs">★</span>
            <span className="font-bold text-xs text-orange-400">{score} pts</span>
          </div>
        </div>
      )}

      {/* 1. COVER */}
      {step === "cover" && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 px-8 text-center">
          <div className="mb-3 bg-slate-800 border border-slate-700 rounded-full px-4 py-1.5 text-cyan-400 text-xs font-semibold tracking-wide">
            ✦ Petualangan Nutrisi
          </div>
          <div className="w-24 h-24 rounded-3xl bg-cyan-400 flex items-center justify-center text-5xl mb-6 shadow-[0_0_0_16px_rgba(34,211,238,0.08)]">
            🥗
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-2">
            Misi<br />
            <span className="text-cyan-400">Makan Sehat</span>
          </h1>
          <p className="text-slate-400 text-sm mb-8">Pilih menu, raih poin, jadi juara</p>
          <button
            onClick={() => setStep("input")}
            className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 px-10 py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          >
            Mulai Sekarang →
          </button>
        </div>
      )}

      {/* 2. INPUT NAMA */}
      {step === "input" && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl mx-auto mb-3">
                👋
              </div>
              <h2 className="text-xl font-bold text-slate-900">Kenalan Yuk!</h2>
              <p className="text-slate-400 text-sm mt-1">Siapkan dirimu untuk petualangan nutrisi</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Nama kamu
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:border-cyan-400 focus:bg-white transition-all"
                  placeholder="Tulis namamu di sini..."
                  onChange={(e) => setNama(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1.5 pl-1">Nama ini akan tampil di leaderboard</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 text-xs text-green-700 font-medium">
                🏆 Raih poin tertinggi & masuk Top 10!
              </div>
              <button
                disabled={!nama}
                onClick={startAdventure}
                className="w-full bg-slate-900 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold text-sm disabled:opacity-30 transition-all active:scale-95"
              >
                Gasss! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODE KOMIK */}
      {step === "comic" &&
        (isMobile ? (
          <div ref={interactiveRef} className="flex md:hidden flex-col bg-slate-900" style={{ minHeight: "calc(100dvh - 52px)" }}>
            {/* Buku */}
            <div className={`flex-1 flex items-center justify-center px-3 pt-3 min-h-0 ${isFinishPageMobile ? "pointer-events-none" : ""}`}>
              <HTMLFlipBook
                width={320} height={480} size="stretch"
                minWidth={280} maxWidth={500} minHeight={400} maxHeight={650}
                usePortrait={true} showCover={true} mobileScrollSupport={true}
                ref={bookRef} className="comic-book rounded-2xl overflow-hidden shadow-2xl"
                onFlip={(e) => setCurrentPage(e.data + 1)}
              >
                {[...Array(totalHalaman)].map((_, i) => (
                  <Halaman key={i + 1} number={i} />
                ))}
              </HTMLFlipBook>
            </div>

            {/* Panel pilihan */}
            <div ref={interactiveRef} className="px-3 pb-4 pt-3 shrink-0">
              {choiceData[currentPage] ? (
                <div className="bg-slate-800 p-4 rounded-2xl flex flex-col gap-3">
                  <div className="text-center text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Pilih langkah berikutnya
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleChoice(choiceData[currentPage].a.p, choiceData[currentPage].a.page)}
                      className="flex-1 flex items-start gap-2 p-3 bg-blue-950 border border-blue-900 rounded-xl active:scale-95 transition-all text-left"
                    >
                      <div className="w-6 h-6 shrink-0 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">A</div>
                      <span className="text-slate-300 text-[10px] leading-snug font-medium">
                        {choiceData[currentPage].a.text}
                      </span>
                    </button>
                    <button
                      onClick={() => handleChoice(choiceData[currentPage].b.p, choiceData[currentPage].b.page)}
                      className="flex-1 flex items-start gap-2 p-3 bg-green-950 border border-green-900 rounded-xl active:scale-95 transition-all text-left"
                    >
                      <div className="w-6 h-6 shrink-0 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-[10px]">B</div>
                      <span className="text-slate-300 text-[10px] leading-snug font-medium">
                        {choiceData[currentPage].b.text}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-[60px]">
                  {(currentPage === totalHalaman || [63, 67, 70].includes(currentPage)) && (
                    <button
                      onClick={saveScore}
                      className="w-full bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
                    >
                      {loading ? "Menyimpan..." : "🏁 Selesai & Simpan!"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-col bg-slate-900" style={{ minHeight: "170dvh" }}>
            <div className={`${isFinishPageDesktop ? "pointer-events-none" : ""} flex-1 flex items-center justify-center p-6`}>
              <HTMLFlipBook
                width={400} height={600} size="stretch"
                minWidth={400} maxWidth={1000} minHeight={500} maxHeight={800}
                usePortrait={false} showCover={true}
                ref={bookRef} className="comic-book rounded-2xl overflow-hidden shadow-2xl"
                onFlip={(e) => setCurrentPage(e.data + 1)}
              >
                {[...Array(totalHalaman)].map((_, i) => (
                  <Halaman key={i + 1} number={i} />
                ))}
              </HTMLFlipBook>
            </div>

            <div ref={interactiveRef} className="px-6 pb-6">
              <div className="max-w-2xl mx-auto">
                {(() => {
                  const activeData = choiceData[currentPage] || choiceData[currentPage + 1];
                  if (activeData) {
                    return (
                      <div className="bg-slate-800 p-6 rounded-3xl flex flex-col gap-4">
                        <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Pilih langkah berikutnya
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleChoice(activeData.a.p, activeData.a.page)}
                            className="flex-1 flex items-start gap-4 p-5 bg-blue-950 border border-blue-900 rounded-2xl hover:border-blue-500 hover:bg-blue-900/50 transition-all active:scale-95 text-left"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-lg">A</div>
                            <span className="flex-1 text-slate-300 text-sm leading-snug font-medium pt-1">{activeData.a.text}</span>
                          </button>
                          <button
                            onClick={() => handleChoice(activeData.b.p, activeData.b.page)}
                            className="flex-1 flex items-start gap-4 p-5 bg-green-950 border border-green-900 rounded-2xl hover:border-green-500 hover:bg-green-900/50 transition-all active:scale-95 text-left"
                          >
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-green-500 text-white flex items-center justify-center font-bold text-lg">B</div>
                            <span className="flex-1 text-slate-300 text-sm leading-snug font-medium pt-1">{activeData.b.text}</span>
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    const isFinishPage = [totalHalaman, 63, 67, 70].some(
                      (p) => p === currentPage || p === currentPage + 1
                    );
                    if (isFinishPage) {
                      return (
                        <div className="flex justify-center max-w-sm mx-auto">
                          <button
                            onClick={saveScore}
                            className="w-full bg-orange-500 hover:bg-orange-400 text-white py-5 rounded-2xl font-bold text-xl transition-all active:scale-95"
                          >
                            {loading ? "Menyimpan..." : "🏁 Selesai & Simpan!"}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  }
                })()}
              </div>
            </div>
          </div>
        ))}

      {/* 4. POST FINISH */}
      {step === "postFinish" && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-6 text-center">
              <h2 className="text-lg font-bold text-white">
                {postFinish === "A" ? "Jalur A" : postFinish === "B" ? "Jalur B" : "Jalur C"}
              </h2>
              <p className="text-slate-400 text-xs mt-1">Klik Next untuk melihat Leaderboard</p>
            </div>
            <div className="p-2  flex justify-center">
              <img
                src={`/komik/pages/Halaman ${postFinish}.png`}
                alt={`Halaman ${postFinish}`}
                className="w-full h-auto rounded-2xl object-cover"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setStep("leaderboard")}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. LEADERBOARD */}
      {step === "leaderboard" && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 py-10">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-center">
              <div className="text-2xl mb-1">🏆</div>
              <h2 className="text-lg font-bold text-white">10 Terbaik</h2>
              <p className="text-slate-400 text-xs mt-1">Sesi ini</p>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 flex gap-2 border-b border-slate-100">
              <button
                onClick={downloadCSV}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl text-[11px] font-bold transition-all"
              >
                ↓ Download CSV
              </button>
              <button
                onClick={resetDatabase}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-2 rounded-xl text-[11px] font-bold transition-all"
              >
                ⚠ Reset Data
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {leaderboard.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                    i === 0
                      ? "bg-amber-50 border-amber-200"
                      : "bg-slate-50 border-transparent"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    i === 0 ? "bg-amber-400 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm capitalize truncate">{item.nama}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">⏱ {formatTime(item.duration || 0)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900 text-base leading-none">{item.skor}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">pts</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all active:scale-95"
              >
                Main Lagi ↺
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .comic-book { background: white; }
      `}</style>
    </div>
  );
}