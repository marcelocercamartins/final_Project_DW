
import { useState } from 'react';
import useSWR from 'swr'

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Home() {
  const { data, mutate } = useSWR("api/hello", fetcher);
  const [merda, setMerda] = useState();
  console.log(data);

  function changeMerda(e: any) {
    setMerda(e.target.value);
  }

  const create = async () => {
    await fetch("api/createUser", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      }
      , body: JSON.stringify({ name: merda })
    })
    mutate();
  }

  const deleteUsers = async (id:any) => {
    console.log(id);
    await fetch("api/deleteUser", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      }
      , body: JSON.stringify({ id: id })
    })
    mutate();
  }

  return (
    <>
      <div>
        {data?.map((key: any) => (
          <div onClick={() => deleteUsers(key.id)}>
            <div> {key.id} </div>
            <div> {key.name} </div>
          </div>
        ))}
      </div>

      <input type="text" onChange={changeMerda}></input>

      <button onClick={create}>criar</button>
    </>
  )
}
