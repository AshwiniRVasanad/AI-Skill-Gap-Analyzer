import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  ////////////////////////////////////////////////////////////////////////////
  // Authentication and Authorization Setup
  ////////////////////////////////////////////////////////////////////////////

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  ////////////////////////////////////////////////////////////////////////////
  // Type Definitions and Comparison Modules
  ////////////////////////////////////////////////////////////////////////////

  // Resume analysis data
  type Resume = {
    id : Nat;
    content : Text;
    skillsExtracted : [Text];
    analysisScore : Nat; // 0-100
    missingSkills : [Text];
    suggestions : [Text];
    timestamp : Time.Time;
  };

  module Resume {
    public func compare(a : Resume, b : Resume) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  // Interview session data
  type InterviewSession = {
    id : Nat;
    role : Text;
    questions : [Text];
    answers : [Text];
    score : Nat;
    feedback : Text;
    timestamp : Time.Time;
  };

  module InterviewSession {
    public func compare(a : InterviewSession, b : InterviewSession) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type UserProfile = {
    id : Principal;
    name : Text;
    email : Text;
    resumes : [Resume];
    interviews : [InterviewSession];
    createdAt : Time.Time;
  };

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      Principal.compare(a.id, b.id);
    };
  };

  type CourseRecommendation = {
    skill : Text;
    courses : [Text];
  };

  ////////////////////////////////////////////////////////////////////////////
  // Persistent State
  ////////////////////////////////////////////////////////////////////////////

  let userProfiles = Map.empty<Principal, UserProfile>();
  let courseRecommendations = Map.empty<Text, CourseRecommendation>();
  var idCounter : Nat = 0;

  ////////////////////////////////////////////////////////////////////////////
  // User Profile Management (Required Interface)
  ////////////////////////////////////////////////////////////////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  ////////////////////////////////////////////////////////////////////////////
  // Additional Profile Management
  ////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func createOrUpdateProfile(name : Text, email : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can save profile data");
    };

    let existingProfile = userProfiles.get(caller);
    let newProfile : UserProfile = switch (existingProfile) {
      case (?profile) {
        {
          id = caller;
          name;
          email;
          resumes = profile.resumes;
          interviews = profile.interviews;
          createdAt = profile.createdAt;
        };
      };
      case (null) {
        {
          id = caller;
          name;
          email;
          resumes = [];
          interviews = [];
          createdAt = Time.now();
        };
      };
    };
    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getProfile(userId : Principal) : async ?UserProfile {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(userId);
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all user profiles");
    };
    userProfiles.values().toArray().sort();
  };

  ////////////////////////////////////////////////////////////////////////////
  // Resume Management
  ////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func saveResume(content : Text, skillsExtracted : [Text], analysisScore : Nat, missingSkills : [Text], suggestions : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save resumes");
    };

    let newResume : Resume = {
      id = idCounter;
      content;
      skillsExtracted;
      analysisScore;
      missingSkills;
      suggestions;
      timestamp = Time.now();
    };
    incrIdCounter();
    let emptyProfile : UserProfile = {
      id = caller;
      name = "";
      email = "";
      resumes = [];
      interviews = [];
      createdAt = Time.now();
    };
    let currentUserProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { emptyProfile };
    };
    let updatedResumes = currentUserProfile.resumes.concat([newResume]);
    let updatedProfile : UserProfile = {
      id = currentUserProfile.id;
      name = currentUserProfile.name;
      email = currentUserProfile.email;
      resumes = updatedResumes;
      interviews = currentUserProfile.interviews;
      createdAt = currentUserProfile.createdAt;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getResumes(userId : Principal) : async [Resume] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own resumes");
    };
    switch (userProfiles.get(userId)) {
      case (?profile) { profile.resumes.sort() };
      case (null) { Runtime.trap("User profile does not exist") };
    };
  };

  public shared ({ caller }) func deleteResume(resumeId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete resumes");
    };

    switch (userProfiles.get(caller)) {
      case (?profile) {
        let filteredResumes = profile.resumes.filter(func(r : Resume) : Bool { r.id != resumeId });
        let updatedProfile : UserProfile = {
          id = profile.id;
          name = profile.name;
          email = profile.email;
          resumes = filteredResumes;
          interviews = profile.interviews;
          createdAt = profile.createdAt;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("User profile does not exist") };
    };
  };

  ////////////////////////////////////////////////////////////////////////////
  // Interview Session Management
  ////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func saveInterview(role : Text, questions : [Text], answers : [Text], score : Nat, feedback : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save interview data");
    };

    let newInterview : InterviewSession = {
      id = idCounter;
      role;
      questions;
      answers;
      score;
      feedback;
      timestamp = Time.now();
    };
    incrIdCounter();
    let emptyProfile : UserProfile = {
      id = caller;
      name = "";
      email = "";
      resumes = [];
      interviews = [];
      createdAt = Time.now();
    };
    let currentUserProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { emptyProfile };
    };
    let updatedInterviews = currentUserProfile.interviews.concat([newInterview]);
    let updatedProfile : UserProfile = {
      id = currentUserProfile.id;
      name = currentUserProfile.name;
      email = currentUserProfile.email;
      resumes = currentUserProfile.resumes;
      interviews = updatedInterviews;
      createdAt = currentUserProfile.createdAt;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getInterviewHistory(userId : Principal) : async [InterviewSession] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own interview history");
    };
    switch (userProfiles.get(userId)) {
      case (?profile) { profile.interviews.sort() };
      case (null) { Runtime.trap("User profile does not exist") };
    };
  };

  ////////////////////////////////////////////////////////////////////////////
  // Course Recommendations
  ////////////////////////////////////////////////////////////////////////////

  public shared ({ caller }) func saveCourseRecommendation(skill : Text, courses : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save course recommendations");
    };
    let recommendation : CourseRecommendation = {
      skill;
      courses;
    };
    courseRecommendations.add(skill, recommendation);
  };

  public query ({ caller }) func getCourseRecommendations(skill : Text) : async ?CourseRecommendation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view course recommendations");
    };
    courseRecommendations.get(skill);
  };

  public query ({ caller }) func getAllCourseRecommendations() : async [CourseRecommendation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view course recommendations");
    };
    courseRecommendations.values().toArray();
  };

  ////////////////////////////////////////////////////////////////////////////
  // Utility & Stats (Admin)
  ////////////////////////////////////////////////////////////////////////////

  public query ({ caller }) func getUserStats() : async [(Principal, Nat, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view user stats");
    };
    userProfiles.entries().toArray().map(func((principal, profile)) { (principal, profile.resumes.size(), profile.interviews.size()) });
  };

  func incrIdCounter() {
    idCounter += 1;
  };
};
