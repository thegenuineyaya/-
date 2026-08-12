import type { Metadata } from "next";
import { WorkflowWorkbench } from "./workflow-workbench";

export const metadata: Metadata = {
  title: "词刷刷短视频量产工作台",
  description: "面向团队共用的词汇短视频 skill 批量生产工作台。",
};

export default function Home() {
  return <WorkflowWorkbench />;
}
