export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ValidationStatus = 'PASSED' | 'REQUIRES REVIEW' | 'FAILED';
export type DecisionStatus = 'VERIFIED' | 'REVIEW REQUIRED' | 'HIGH RISK';
export type OfficerDecision = 'PENDING' | 'APPROVED' | 'SECONDARY' | 'DENIED';

export interface ExtractedDocumentData {
  fullName: string;
  fullNameConfidence: number;
  passportNumber: string;
  passportNumberConfidence: number;
  nationality: string;
  nationalityConfidence: number;
  gender: string;
  genderConfidence: number;
  dateOfBirth: string;
  dateOfBirthConfidence: number;
  dateOfExpiry: string;
  dateOfExpiryConfidence: number;
  visaNumber: string;
  visaNumberConfidence: number;
  visaType: string;
  visaTypeConfidence: number;
  entryValidation: string;
  entryValidationConfidence: number;
  stayDuration: string;
  stayDurationConfidence: number;
  mrzCode: string;
  mrzValid: boolean;
}

export interface ValidationItem {
  id: string;
  label: string;
  status: 'valid' | 'warning' | 'invalid';
  description: string;
}

export interface TamperAnomaly {
  id: string;
  region: string;
  riskScore: number;
  status: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  boxCoordinates: { x: number; y: number; width: number; height: number }; // percentages
}

export interface TamperingResult {
  overallRisk: number;
  status: 'AUTHENTIC' | 'SUSPICIOUS' | 'TAMPERED';
  photoReplacementRisk: number;
  photoReplacementStatus: 'Low' | 'Medium' | 'High';
  textManipulationRisk: number;
  textManipulationStatus: 'Low' | 'Medium' | 'High';
  stampForgeryRisk: number;
  stampForgeryStatus: 'Low' | 'Medium' | 'High';
  metadataAnomalyRisk: number;
  metadataAnomalyStatus: 'Low' | 'Medium' | 'High';
  explanation: string;
  anomalies: TamperAnomaly[];
}

export interface FaceVerificationResult {
  faceMatchScore: number;
  status: 'VERIFIED' | 'REVIEW REQUIRED' | 'HIGH RISK';
  livenessScore: number;
  livenessStatus: 'LIVE HUMAN' | 'SPOOF DETECTED' | 'INCONCLUSIVE';
  landmarksAligned: boolean;
  cosineSimilarity: number;
  explanation: string;
}

export interface RiskAssessment {
  overallScore: number;
  riskLevel: RiskLevel;
  finalDecision: DecisionStatus;
  extractionConfidenceAvg: number;
  documentValidationState: 'PASS' | 'REVIEW' | 'FAIL';
  tamperingRiskPct: number;
  faceMatchPct: number;
  explanationPoints: string[];
}

export interface VerificationCase {
  caseId: string;
  timestamp: string;
  officerId: string;
  documentType: 'PASSPORT' | 'VISA' | 'DIPLOMATIC_ID' | 'NATIONAL_ID' | 'INVALID_SPECIMEN' | string;
  fileName: string;
  imagePreviewUrl?: string;
  passportPhotoUrl?: string;
  capturedCameraPhotoUrl?: string;
  isValidDocument?: boolean;
  rejectionReason?: string;
  extractedData: ExtractedDocumentData;
  validationChecklist: ValidationItem[];
  tamperingResult: TamperingResult;
  faceVerificationResult: FaceVerificationResult;
  riskAssessment: RiskAssessment;
  officerDecision: OfficerDecision;
  officerNotes?: string;
  sha256Hash: string;
  processingTimeSec: number;
  isSimulatedDemo?: boolean;
}

export interface OfficerProfile {
  id: string;
  name: string;
  badgeNumber: string;
  checkpointLocation: string;
  clearanceLevel: string;
}
