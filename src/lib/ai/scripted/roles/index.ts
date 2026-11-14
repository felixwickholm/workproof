import type { RoleTemplate } from "../role-template";
import { accountant } from "./accountant";
import { aiEngineer } from "./ai-engineer";
import { backendEngineer } from "./backend";
import { cloudArchitect } from "./cloud-architect";
import { dataAnalyst } from "./data-analyst";
import { dataEngineer } from "./data-engineer";
import { dataScientist } from "./data-scientist";
import { devopsEngineer } from "./devops-sre";
import { embeddedEngineer } from "./embedded-robotics";
import { frontendEngineer } from "./frontend";
import { fullStackEngineer } from "./full-stack";
import { marketingSpecialist } from "./marketing";
import { mlEngineer } from "./ml-engineer";
import { mobileEngineer } from "./mobile";
import { nurse } from "./nurse";
import { productManager } from "./product-manager";
import { projectManager } from "./project-manager";
import { qaEngineer } from "./qa-automation";
import { quantumResearcher } from "./quantum-researcher";
import { securityEngineer } from "./security";
import { solutionsEngineer } from "./solutions-engineer";
import { teacher } from "./teacher";
import { technicalWriter } from "./technical-writer";
import { uxDesigner } from "./ux-designer";

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
];

export function roleById(id: string): RoleTemplate | undefined {
  return ROLES.find((role) => role.id === id);
}
