import { auth } from "@/app/(auth)/auth";
import { list } from "@vercel/blob";

export async function GET() {
  let session = await auth();

  const guestEmail = process.env.GUEST_EMAIL;
  if (!session) {
    const { blobs } = await list({ prefix: guestEmail });

    return Response.json(
      blobs.map((blob) => ({
        ...blob,
        pathname: blob.pathname.replace(`${guestEmail}/`, ""),
      }))
    );
  }

  const { user } = session;

  if (!user) {
    const { blobs } = await list({ prefix: guestEmail });

    return Response.json(
      blobs.map((blob) => ({
        ...blob,
        pathname: blob.pathname.replace(`${guestEmail}/`, ""),
      }))
    );
  }

  const { blobs } = await list({ prefix: user.email! });

  return Response.json(
    blobs.map((blob) => ({
      ...blob,
      pathname: blob.pathname.replace(`${user.email}/`, ""),
    }))
  );
}
