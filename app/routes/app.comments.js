import db from "../db.server";

export async function loader({ request, params }) {
    let dt=await db.comments.findMany();
    return dt;
  }

  



export async function action({ request }) {
    await { ...Object.fromEntries(await request.formData()) };
      return null;
    }