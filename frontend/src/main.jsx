import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppNew from './AppNew'
import './styles.css'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <ColorModeScript />
      <BrowserRouter>
        <AppNew/>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
)
