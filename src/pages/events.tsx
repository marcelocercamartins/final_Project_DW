import { Button } from "@mantine/core";
import { Table } from '@mantine/core';
import useSWR from "swr";
const fetcher = (...args) => fetch(...args).then((res) => res.json())

const eventsPage = () => {
    const { data, mutate } = useSWR("api/getEvents", fetcher);

    console.log(
        data
    )

    const elements = [
        { Name: 6, Location: 12.011, eventDate: 'C' },
        { Name: 7, Location: 14.007, eventDate: 'N'}
    ];
    
    const rows = elements.map((element) => (
        <Table.Tr key={element.Name}>
            <Table.Td>{element.Name}</Table.Td>
            <Table.Td>{element.Location}</Table.Td>
            <Table.Td>{element.eventDate}</Table.Td>
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