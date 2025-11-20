#!/usr/bin/env node
import 'dotenv/config'
import GoogleFonts from './GoogleFonts';
import Console from './Console';

main();

async function main() {
    
    
    await Console.menu();
    
    
}