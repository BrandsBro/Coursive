import EmailTemplateEditor from "@/components/admin/EmailTemplateEditor";
export default function EmailEditorPage({ params }) {
  return <EmailTemplateEditor templateId={params.id} />;
}
