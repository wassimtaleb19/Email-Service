import LinkAccountButton from "@/components/link-account-button";

export default async function Home() {
  return (
    <div className="m-4">
      <h1 className="text-6xl">OAuth:</h1>
      <LinkAccountButton />
      <p>-------------------------------------------</p>
      <p>the above link is working locally and on the deployment</p>
    </div>
  );
}
