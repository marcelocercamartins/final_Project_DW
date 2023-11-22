import { TextInput, PasswordInput, Flex } from '@mantine/core';

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
            </Flex>

        </>
    )
}

export default loginPage;