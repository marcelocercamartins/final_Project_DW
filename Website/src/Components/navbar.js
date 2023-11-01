import React, {useState} from 'react'
import Logo from '../images/logo.jpg';
import {Link} from "react-router-dom";
import "../Styles/navbar.css"
import TocIcon from '@mui/icons-material/Toc';
import { Button } from '@mui/material';


function navbar() {

  //const [open_links, set_open_links] = useState(false);   https://youtu.be/QwarZBtFoFA?t=2199

  return (
    <div className='navbar'>
      
      <div className='left_side'>
        <img src={Logo}/> 

        <div className='hiddenLinks'>
          <Link to ="/"> Home </Link>
          <Link to ="/my_events"> Meus Eventos </Link>
          <Link to ="/check_events"> Consultar Eventos </Link>
          <Link to ="/Login"> Login </Link>
        </div>

      </div>
      
      <div className='right_side'>    

        <Link to ="/"> Home </Link>
        <Link to ="/my_events"> Meus Eventos </Link>
        <Link to ="/check_events"> Consultar Eventos </Link>
        <Link to ="/Login"> Login </Link>
        
        <Button>
          <TocIcon />
        </Button>
      </div>
    </div>
  )
}

export default navbar