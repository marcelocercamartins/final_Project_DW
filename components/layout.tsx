import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Button, Group} from '@mantine/core';
import { Props } from 'next/script';

function MainLayout ({children}: Props) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const lista = [{
    id: "1", name: "Home", url:"/" /* fica apenas / para ele voltar ao index, que está a ser usado como home page */
  },  {
    id:"2" , name:"Eventos", url:"events"
  }, {
    id:"3", name: "Meus Eventos", url:"myEvents"
  }]

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
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        {lista.map((item) => (
          <Button id = {item.id} variant="filled" size="compact-md" radius="xl" mt="md" component='a' href={item.url}>{item.name}</Button>
        ))}
        <Button variant="filled" color="green" size="compact-md" radius="xl" fz="md" mt="md" component='a' href='login'>Login</Button>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

export default MainLayout;