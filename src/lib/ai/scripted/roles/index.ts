import type { RoleTemplate } from "../role-template";
import { accountant } from "./accountant";
import { aiEngineer } from "./ai-engineer";
import { backendEngineer } from "./backend";
import { childcareWorker } from "./childcare";
import { cleaningSupervisor } from "./cleaning-supervisor";
import { cloudArchitect } from "./cloud-architect";
import { cook } from "./cook";
import { customerServiceAgent } from "./customer-service";
import { dataAnalyst } from "./data-analyst";
import { dataEngineer } from "./data-engineer";
import { dataScientist } from "./data-scientist";
import { devopsEngineer } from "./devops-sre";
import { driver } from "./driver";
import { electrician } from "./electrician";
import { embeddedEngineer } from "./embedded-robotics";
import { frontendEngineer } from "./frontend";
import { fullStackEngineer } from "./full-stack";
import { graphicDesigner } from "./graphic-designer";
import { healthCommunicator } from "./health-communicator";
import { homeCareCoordinator } from "./home-care-coordinator";
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
import { teacher } from "./teacher";
import { technicalWriter } from "./technical-writer";
import { renovationWorker } from "./tiler";
import { uxDesigner } from "./ux-designer";
import { warehouseWorker } from "./warehouse-worker";

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
];
