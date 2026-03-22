import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CourseRecommendation {
    courses: Array<string>;
    skill: string;
}
export type Time = bigint;
export interface Resume {
    id: bigint;
    content: string;
    suggestions: Array<string>;
    analysisScore: bigint;
    skillsExtracted: Array<string>;
    timestamp: Time;
    missingSkills: Array<string>;
}
export interface UserProfile {
    id: Principal;
    name: string;
    createdAt: Time;
    resumes: Array<Resume>;
    email: string;
    interviews: Array<InterviewSession>;
}
export interface InterviewSession {
    id: bigint;
    answers: Array<string>;
    role: string;
    feedback: string;
    score: bigint;
    timestamp: Time;
    questions: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(name: string, email: string): Promise<void>;
    deleteResume(resumeId: bigint): Promise<void>;
    getAllCourseRecommendations(): Promise<Array<CourseRecommendation>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourseRecommendations(skill: string): Promise<CourseRecommendation | null>;
    getInterviewHistory(userId: Principal): Promise<Array<InterviewSession>>;
    getProfile(userId: Principal): Promise<UserProfile | null>;
    getResumes(userId: Principal): Promise<Array<Resume>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStats(): Promise<Array<[Principal, bigint, bigint]>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCourseRecommendation(skill: string, courses: Array<string>): Promise<void>;
    saveInterview(role: string, questions: Array<string>, answers: Array<string>, score: bigint, feedback: string): Promise<void>;
    saveResume(content: string, skillsExtracted: Array<string>, analysisScore: bigint, missingSkills: Array<string>, suggestions: Array<string>): Promise<void>;
}
