import { TextInput, PasswordInput, Flex, Button } from '@mantine/core';

const loginPage = () => {
    return (
        <>
            <Flex
                h={150}
                w={500}
                mt={300}
                ml={500}
                gap="md"
                justify="center"
                align="center"
                direction="column"
                wrap="wrap"
            >
                <TextInput id="UsernameInput"
                    placeholder="Username"
                    radius="xl"
                    w={400}
                />
                <PasswordInput id="PasswordInput"
                    radius="xl"
                    placeholder="Password"
                    w={400}
                />
                <Button variant="filled" color="green" size="md" radius="xl" p={5} w={100}>Entrar</Button>
            </Flex>

        </>
    )
}

export default loginPage;