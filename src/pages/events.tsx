import { TextInput, Checkbox, Button, Group, Box, Table, Flex, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Props } from 'next/script';
import useSWR from "swr";
const fetcher = (...args) => fetch(...args).then((res) => res.json())

//types
type eventsProps = {
    eventID: Number,
    eventName: String,
    eventDate: Date,
    eventLocation: String
}

const eventsPage = ():Props => {
    //tabel events
    const { data } = useSWR("api/getEvents", fetcher);
    
    //return html code
    return (
        <Flex
            mih={255}
            h="100%"
            gap="md"
            justify="flex-start"
            align="left"
            direction="column"
        >
        <Button w={150} ml="84%" component='a' href="createEvent">Adicionar Evento</Button>
        
        {data?.map((element: eventsProps) => (
           <Button w={500} h={50} variant='transparent' justify="left" >{element.eventName}|{element.eventDate}|{element.eventLocation}</Button>
          ))}
          
        </Flex>
    )
}

export default eventsPage;