import { Button } from "@mantine/core";
import { Table } from '@mantine/core';
import useSWR from "swr";
const fetcher = (...args) => fetch(...args).then((res) => res.json())

type eventsProps = {
    eventId: Number,
    eventName: String,
    eventDate: Date,
    eventLocation: String

}

const eventsPage = () => {
    const { data, mutate } = useSWR("api/getEvents", fetcher);

    console.log(
        data
    )


    const rows = data?.map((element: eventsProps) => (
        <Table.Tr key={element.eventId.toString()}>
            <Table.Td>{element.eventName}</Table.Td>
            <Table.Td>{element.eventLocation}</Table.Td>
            <Table.Td>{element.eventDate?.toString()}</Table.Td>
        </Table.Tr>
    ));

    
    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Nome</Table.Th>
                    <Table.Th>Localização</Table.Th>
                    <Table.Th>Data de envento</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    )
}

export default eventsPage;