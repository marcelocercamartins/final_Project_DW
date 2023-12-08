import { TextInput, Checkbox, Button, Group, Box, Table } from '@mantine/core';
import { useForm } from '@mantine/form';
import useSWR from "swr";
const fetcher = (...args) => fetch(...args).then((res) => res.json())


//types
type eventsProps = {
    eventID: Number,
    eventName: String,
    eventDate: Date,
    eventLocation: String
}

const createEventsPage = () => {

    //user form to add new events
    const form = useForm(
        {
            initialValues: { eventName: '', eventDate: '', eventLocation: '', }//,
            // validate: { eventName: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),},
        });


    const handleForm = async () => {
        alert(1)
        console.log("teste");

        const response = await fetch('/createEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({form}),
        });
    };



    //tabel events
    const { data, mutate } = useSWR("api/getEvents", fetcher);
    const rows = data?.map((element: eventsProps) => (
        <Table.Tr key={element.eventID.toString()}>
            <Table.Td>{element.eventName}</Table.Td>
            <Table.Td>{element.eventLocation}</Table.Td>
            <Table.Td>{element.eventDate?.toString()}</Table.Td>
        </Table.Tr>
    ));

    //return html code
    return (
        <>
            <form onSubmit={form.onSubmit((values) => console.log(values))}>
                <TextInput
                    withAsterisk
                    label="Nome do Evento"
                    placeholder="Nome Aqui"
                    {...form.getInputProps('eventName')}
                />
                <TextInput
                    withAsterisk
                    label="Data do Evento"
                    placeholder="Data Aqui"
                    {...form.getInputProps('eventDate')}
                />
                <TextInput
                    withAsterisk
                    label="Localização do Evento"
                    placeholder="Localização Aqui"
                    {...form.getInputProps('eventLocation')}
                />
                <Group justify="flex-center" mt="md">
                    <Button type="submit" variant="outline">Adicionar Eventos</Button>
                </Group>
            </form>
            <button onClick={handleForm}>Clique-me</button>

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
        </>
    )
}

export default createEventsPage;