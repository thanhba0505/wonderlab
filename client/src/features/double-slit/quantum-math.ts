/**
 * Quantum Double-Slit Mathematical Simulation Core
 * Wonderlab Scientific Platform
 */

export interface QuantumParameters {
  /** Bước sóng ánh sáng (đơn vị: mét, vd: 532e-9 = 532nm laser xanh lục) */
  wavelength: number;
  /** Khoảng cách giữa 2 tâm khe (đơn vị: mét, vd: 20e-6 = 20µm) */
  slitDistance: number;
  /** Độ rộng của mỗi khe hẹp (đơn vị: mét, vd: 4e-6 = 4µm) */
  slitWidth: number;
  /** Khoảng cách từ tấm chắn 2 khe đến màn huỳnh quang (đơn vị: mét, vd: 1.0m) */
  screenDistance: number;
  /** Trạng thái máy quan sát / detector tại 2 khe: bật (đo lường) hay tắt (không đo lường) */
  isObserverActive: boolean;
}

export const DEFAULT_QUANTUM_PARAMS: QuantumParameters = {
  wavelength: 532e-9, // 532nm (Laser xanh lá)
  slitDistance: 25e-6, // 25µm
  slitWidth: 5e-6, // 5µm
  screenDistance: 1.0, // 1.0m
  isObserverActive: false,
};

/**
 * Hàm số Sinc chuẩn hóa: sinc(x) = sin(x) / x
 */
export function sinc(x: number): number {
  if (Math.abs(x) < 1e-9) return 1.0;
  return Math.sin(x) / x;
}

/**
 * Tính cường độ xác suất tại tọa độ y trên màn hứng (y = 0 là tâm trục chính)
 * Trả về giá trị chuẩn hóa trong khoảng [0, 1]
 */
export function calculateIntensity(y: number, params: QuantumParameters): number {
  const { wavelength, slitDistance, slitWidth, screenDistance, isObserverActive } = params;

  if (wavelength <= 0 || screenDistance <= 0) return 0;

  if (!isObserverActive) {
    // 1. Trường hợp KHÔNG QUAN SÁT (Observer OFF):
    // Giao thoa 2 khe Young hoàn chỉnh với bao nhiễu xạ:
    // I(y) = cos^2(pi * d * y / (lambda * D)) * sinc^2(pi * a * y / (lambda * D))
    const phaseInterference = (Math.PI * slitDistance * y) / (wavelength * screenDistance);
    const phaseDiffraction = (Math.PI * slitWidth * y) / (wavelength * screenDistance);

    const cosTerm = Math.cos(phaseInterference);
    const sincTerm = sinc(phaseDiffraction);

    return cosTerm * cosTerm * sincTerm * sincTerm;
  } else {
    // 2. Trường hợp CÓ QUAN SÁT (Observer ON - Hàm sóng sụp đổ):
    // Máy đo lường biết chắc hạt qua khe 1 (tâm y = +d/2) hoặc khe 2 (tâm y = -d/2).
    // Không còn hiện tượng giao thoa sóng, chỉ còn tổng xác suất cổ điển của 2 khe:
    // I_obs(y) = 0.5 * sinc^2(pi * a * (y - d/2) / (lambda * D)) + 0.5 * sinc^2(pi * a * (y + d/2) / (lambda * D))
    const offset1 = y - slitDistance / 2;
    const offset2 = y + slitDistance / 2;

    const phaseDiff1 = (Math.PI * slitWidth * offset1) / (wavelength * screenDistance);
    const phaseDiff2 = (Math.PI * slitWidth * offset2) / (wavelength * screenDistance);

    const sinc1 = sinc(phaseDiff1);
    const sinc2 = sinc(phaseDiff2);

    return 0.5 * (sinc1 * sinc1 + sinc2 * sinc2);
  }
}

/**
 * Sinh phân bố cường độ lý thuyết dọc theo màn hứng để vẽ biểu đồ
 */
export function generateIntensityProfile(
  params: QuantumParameters,
  pointsCount: number = 200,
  yRangeMeters: number = 0.05, // ±5cm trên màn
): { yMm: number; intensity: number }[] {
  const points: { yMm: number; intensity: number }[] = [];
  const step = (2 * yRangeMeters) / (pointsCount - 1);

  for (let i = 0; i < pointsCount; i++) {
    const y = -yRangeMeters + i * step;
    const intensity = calculateIntensity(y, params);
    points.push({
      yMm: parseFloat((y * 1000).toFixed(2)),
      intensity: parseFloat(intensity.toFixed(4)),
    });
  }

  return points;
}

/**
 * Sinh tọa độ va chạm của 1 hạt đơn lẻ trên màn theo phương pháp Rejection Sampling
 * Trả về tọa độ y theo đơn vị mét
 */
export function sampleHitPosition(params: QuantumParameters, yRangeMeters: number = 0.05): number {
  const maxAttempts = 1000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateY = (Math.random() * 2 - 1) * yRangeMeters;
    const probability = calculateIntensity(candidateY, params);
    if (Math.random() <= probability) {
      return candidateY;
    }
  }
  // Fallback ngẫu nhiên nếu vượt ngưỡng thử
  return (Math.random() * 2 - 1) * yRangeMeters;
}

/**
 * Sinh nhanh một loạt hạt va chạm Monte Carlo
 */
export function sampleBatchHits(
  count: number,
  params: QuantumParameters,
  yRangeMeters: number = 0.05,
): Float32Array {
  const hits = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    hits[i] = sampleHitPosition(params, yRangeMeters);
  }
  return hits;
}

/**
 * Chuyển đổi bước sóng (nm) thành mã màu CSS chân thực
 */
export function wavelengthToRgb(wavelengthNm: number): string {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = -(wavelengthNm - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelengthNm >= 440 && wavelengthNm < 490) {
    r = 0.0;
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelengthNm >= 490 && wavelengthNm < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelengthNm - 510) / (510 - 490);
  } else if (wavelengthNm >= 510 && wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelengthNm >= 580 && wavelengthNm < 645) {
    r = 1.0;
    g = -(wavelengthNm - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelengthNm >= 645 && wavelengthNm <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  } else {
    return 'rgb(59, 130, 246)'; // Default blue
  }

  // Điều chỉnh cường độ ở rìa quang phổ thị giác
  let factor = 1.0;
  if (wavelengthNm >= 380 && wavelengthNm < 420) {
    factor = 0.3 + (0.7 * (wavelengthNm - 380)) / (420 - 380);
  } else if (wavelengthNm >= 700 && wavelengthNm <= 750) {
    factor = 0.3 + (0.7 * (750 - wavelengthNm)) / (750 - 700);
  }

  const red = Math.round(r * factor * 255);
  const green = Math.round(g * factor * 255);
  const blue = Math.round(b * factor * 255);

  return `rgb(${red}, ${green}, ${blue})`;
}
