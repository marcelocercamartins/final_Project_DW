import { useDisclosure } from '@mantine/hooks';
import NextImage from 'next/image';
import { AppShell, Burger, Button, Flex, Group, Image } from '@mantine/core';
import { Props } from 'next/script';
import Logo from '/public/img/logo.jpg';

function MainLayout({ children }: Props) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const navbarButtons = defineNavbarButtons()

  return (
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Image component={NextImage} radius="md" h={55} w={55} fit="contain" src={Logo} alt="My image" /> Event Eagle
          </Group>
        </AppShell.Header>
        <AppShell.Navbar p="md">
          <Flex
            mih={255}
            h="100%"
            gap="md"
            justify="flex-start"
            align="center"
            direction="column"
          >
            {navbarButtons.map((item) => (
              <Button id={item.id} variant="filled" radius="xl" mt="md" w={200} p={5} component='a' href={item.url}>{item.name}</Button>
            ))}
          </Flex>
        </AppShell.Navbar>
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    );
  }

export default MainLayout;

function defineNavbarButtons(){
  let UserLogged = 0;
  // codigo para fazer verificação de login
  
  if (UserLogged == 0){
    const navbarButtons = [{
      id: "1", name: "Home", url: "/" /* fica apenas / para ele voltar ao index, que está a ser usado como home page */
    }, {
      id: "2", name: "Eventos", url: "events"
    }, {
      id: "3", name: "Login", url: "login"
    }, {
      id: "4", name: "Criar Conta", url: "createAccount"
    }]

    return navbarButtons

  }else{
    const navbarButtons = [{
      id: "1", name: "Home", url: "/" /* fica apenas / para ele voltar ao index, que está a ser usado como home page */
    }, {
      id: "2", name: "Eventos", url: "events"
    }, {
      id: "3", name: "Meus Eventos", url: "myEvents"
    }, {
      id: "4", name: "Logout", url: "login"
    }]

    return navbarButtons
  }
}