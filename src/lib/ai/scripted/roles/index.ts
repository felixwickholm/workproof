import type { RoleTemplate } from "../role-template";
import { accountant } from "./accountant";
import { aiEngineer } from "./ai-engineer";
import { architect } from "./architect";
import { automationDeveloper } from "./automation-developer";
import { backendEngineer } from "./backend";
import { businessAnalyst } from "./business-analyst";
import { chipVerificationEngineer } from "./chip-verification-engineer";
import { childcareWorker } from "./childcare";
import { cleaningSupervisor } from "./cleaning-supervisor";
import { cloudArchitect } from "./cloud-architect";
import { cook } from "./cook";
import { customerServiceAgent } from "./customer-service";
import { dataAnalyst } from "./data-analyst";
import { dataEngineer } from "./data-engineer";
import { dataScientist } from "./data-scientist";
import { devopsEngineer } from "./devops-sre";
import { doctor } from "./doctor";
import { driver } from "./driver";
import { electrician } from "./electrician";
import { embeddedEngineer } from "./embedded-robotics";
import { foodScientist } from "./food-scientist";
import { frontendEngineer } from "./frontend";
import { fullStackEngineer } from "./full-stack";
import { graphicDesigner } from "./graphic-designer";
import { hardwareTestEngineer } from "./hardware-test-engineer";
import { healthCommunicator } from "./health-communicator";
import { homeCareCoordinator } from "./home-care-coordinator";
import { hrSpecialist } from "./hr-specialist";
import { keyAccountManager } from "./key-account-manager";
import { labOperationsPlanner } from "./lab-operations-planner";
import { lawyer } from "./lawyer";
import { marketingSpecialist } from "./marketing";
import { mlEngineer } from "./ml-engineer";
import { mobileEngineer } from "./mobile";
import { nurse } from "./nurse";
import { productManager } from "./product-manager";
import { projectManager } from "./project-manager";
import { qaEngineer } from "./qa-automation";
import { quantumResearcher } from "./quantum-researcher";
import { salesAssistant } from "./sales-assistant";
import { securityEngineer } from "./security";
import { solutionsEngineer } from "./solutions-engineer";
import { structuralEngineer } from "./structural-engineer";
import { teacher } from "./teacher";
import { technicalWriter } from "./technical-writer";
import { researchScientist } from "./research-scientist";
import { renovationWorker } from "./tiler";
import { uxDesigner } from "./ux-designer";
import { warehouseWorker } from "./warehouse-worker";
import { webDesigner } from "./web-designer";

/**
 * The task library. Practice tasks on /try accept any job, so the library also keeps jobs that need no
 * degree (level "practice"); the demo event uses degree-level roles only. Order breaks ties when a need
 * matches two roles equally, so new roles go at the end.
 */
export const ROLES: readonly RoleTemplate[] = [
  backendEngineer,
  frontendEngineer,
  fullStackEngineer,
  mobileEngineer,
  mlEngineer,
  aiEngineer,
  dataEngineer,
  dataScientist,
  devopsEngineer,
  securityEngineer,
  embeddedEngineer,
  qaEngineer,
  productManager,
  projectManager,
  uxDesigner,
  dataAnalyst,
  cloudArchitect,
  quantumResearcher,
  solutionsEngineer,
  technicalWriter,
  accountant,
  marketingSpecialist,
  nurse,
  teacher,
  homeCareCoordinator,
  healthCommunicator,
  cook,
  renovationWorker,
  electrician,
  warehouseWorker,
  driver,
  customerServiceAgent,
  salesAssistant,
  graphicDesigner,
  cleaningSupervisor,
  childcareWorker,
  foodScientist,
  structuralEngineer,
  hardwareTestEngineer,
  keyAccountManager,
  labOperationsPlanner,
  doctor,
  lawyer,
  architect,
  hrSpecialist,
  businessAnalyst,
  researchScientist,
  chipVerificationEngineer,
  automationDeveloper,
  webDesigner,
];
