import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Deteksi tiupan lewat mikrofon, dibuat supaya jalan di HP.
 *
 * Pemakaian:
 *   const { start, level, error, listening } = useBlowDetection({
 *     threshold: 0.12,        // makin kecil = makin sensitif
 *     holdMs: 350,            // tiupan harus bertahan segini lama
 *     onBlow: () => padamkanLilin(),
 *   });
 *   <button onClick={start}>Mulai tiup 🎂</button>   // WAJIB dari tap user
 *
 * `level` (0..1) bisa dipakai untuk mengisi .mic-bar-fill-scrap.
 */
export function useBlowDetection({ threshold = 0.12, holdMs = 350, onBlow } = {}) {
  const [level, setLevel] = useState(0);
  const [error, setError] = useState(null);
  const [listening, setListening] = useState(false);

  const ctxRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const onBlowRef = useRef(onBlow);
  onBlowRef.current = onBlow;

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);

    // 1. Mikrofon hanya boleh di HTTPS (atau localhost). Lewat http://192.168.x.x akan ditolak.
    if (!window.isSecureContext) return setError('Buka lewat HTTPS supaya mikrofon bisa dipakai.');
    if (!navigator.mediaDevices?.getUserMedia) return setError('Browser ini tidak mendukung mikrofon.');

    try {
      // 2. Matikan filter suara HP: noise suppression menganggap tiupan itu "angin"
      //    lalu membuangnya, jadi levelnya tidak pernah naik.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // 3. iOS membuat AudioContext dalam keadaan "suspended" — harus di-resume
      //    dari tap user.
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      await ctx.resume();

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);

      ctxRef.current = ctx;
      streamRef.current = stream;
      setListening(true);

      // 4. Tiupan = energi noise di frekuensi rendah (< 1500 Hz),
      //    lebih andal daripada volume total.
      const data = new Uint8Array(analyser.frequencyBinCount);
      const binHz = ctx.sampleRate / analyser.fftSize;
      const maxBin = Math.max(1, Math.floor(1500 / binHz));
      let since = 0;
      let fired = false;
      let lastLevel = 0;

      const tick = (t) => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < maxBin; i++) sum += data[i];
        const lv = sum / maxBin / 255;

        if (Math.abs(lv - lastLevel) > 0.02) {
          lastLevel = lv;
          setLevel(lv);
        }

        if (lv > threshold) {
          if (!since) since = t;
          if (!fired && t - since > holdMs) {
            fired = true;
            onBlowRef.current?.();
          }
        } else {
          since = 0;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      setError(
        e?.name === 'NotAllowedError'
          ? 'Izin mikrofon ditolak. Aktifkan di pengaturan browser, lalu coba lagi.'
          : 'Mikrofon tidak bisa dipakai.'
      );
    }
  }, [threshold, holdMs]);

  useEffect(() => stop, [stop]);

  return { start, stop, level, error, listening };
}