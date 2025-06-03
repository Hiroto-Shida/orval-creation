export default function Home() {
  return (
    <main>
      <div>Hello world!</div>
    </main>
  );
}

/** 変更後コード */
// import { getColorfulMoai } from "@/client/api";

// export default async function Home() {

//   const res = await getColorfulMoai({
//     cache: "no-cache",
//   });

//   return (
//     <main>
//       <div>{JSON.stringify(res.data)}</div>
//     </main>
//   );
// }
