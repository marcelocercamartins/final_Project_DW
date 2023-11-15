import Image from 'next/image'
import Link from "next/link"

const Header = () => {
    return (
        // navbar section
        <nav className="navbar navbar-expand-lg bg-light ">
            <a className="navbar-brand mb-0 h1">
                <Image
                    src="/img/logo.jpg"
                    alt=""
                    width={60}
                    height={60}
                    style={{ marginRight: '10px', marginLeft: '10px' }} />
                EventEagle</a>

            <div className="navbar-collapse ">
                <ul className="navbar-nav ">
                    <a className="nav-link" href="/homePage">Home</a>
                    <a className="nav-link" href="/events">Eventos</a>
                    <a className="nav-link" href="/myEvents">Meus Eventos</a>
                </ul>
            </div>
            <div>
                <form className="form">
                <Link href={"/login"}>
                    <button className="btn btn-outline-success" type="button">Login</button>
                    </Link>
                </form>

            </div>
        </nav>
    )
}

export default Header