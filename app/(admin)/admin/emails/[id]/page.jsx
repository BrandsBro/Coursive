import EmailTemplateEditor from "@/components/admin/EmailTemplateEditor";
export default async function EmailEditorPage({ params }) {
  const { id } = await params;
  return <EmailTemplateEditor templateId={id} />;
}
