#!/usr/bin/env node
import 'dotenv/config'
import GoogleFonts from './GoogleFonts';
import Console from './Console';

main();

async function main() {
    await GoogleFonts.init();
    
    await Console.menu();
    
    await GoogleFonts.close();
}