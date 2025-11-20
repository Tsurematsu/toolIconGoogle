import 'dotenv/config'
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-extra';
import getIconCallback from './Callback_getIcon';
import searchIconCallback from './Callback_searchIcon'
import { Browser, Page } from 'puppeteer';

export default class GoogleFonts{
    private static downloadPath = path.resolve(__dirname, './downloads');
    private static page : Page = null;
    private static iconSelected = ''
    private static cacheNameFile = ''
    private static client = null;
    private static resolveIcon = (_r)=>{}
    private static browser : Browser | null = null;
    public static getDownloadPath = ()=>{
        return this.downloadPath
    }
    public static async setDirDownloads(newPath){
        this.downloadPath = newPath
        await this.client.send('Browser.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: this.downloadPath,
            eventsEnabled: true
        });
    }
    private static async downloadManager(){
        this.client = await this.page.createCDPSession();
        await this.client.send('Browser.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: this.downloadPath,
            eventsEnabled: true
        });
        this.client.on('Browser.downloadWillBegin', (event) => {this.cacheNameFile = event.suggestedFilename;});
        this.client.on('Browser.downloadProgress', (event) => {
            if (event.state === 'completed') {
                const oldPath = path.join(this.downloadPath, this.cacheNameFile);
                const newPath = path.join(this.downloadPath, `${this.iconSelected}.svg`);
                fs.renameSync(oldPath, newPath);
                this.resolveIcon(newPath)
            } else if (event.state === 'canceled') {
                this.resolveIcon(null)
            }
        });
    }

    public static async getIcon(iconName, time = 600){
        this.iconSelected = iconName;
        await this.page!.evaluate(getIconCallback, iconName, time)
        return await new Promise(r=>this.resolveIcon=r);
    }
    
    public static async searchIcon(iconName="", time=400){
        return await this.page!.evaluate(searchIconCallback, iconName, time)
    }
    
    public static async close(){
        await this.page.close();
        await this.browser.close()
    }

    public static async init(){
        if (this.browser != null) return;
        if (!fs.existsSync(this.downloadPath)) fs.mkdirSync(this.downloadPath, { recursive: true });
        this.browser = await puppeteer.launch({
            headless: true,
            // headless: false,
            args: [
                '--auto-open-devtools-for-tabs',
                '--force-dark-mode',
                '--enable-features=WebUIDarkMode',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list',
            ],
            defaultViewport: { width: 1920, height: 1080 },
        });
        this.page = await this.browser.newPage();
        await this.downloadManager()
        await this.page.goto('https://fonts.google.com/icons?icon.size=24&icon.color=%23e3e3e3', {
            waitUntil: 'networkidle2'
        });
        const script = await fs.readFileSync(path.resolve(__dirname, "./GoogleFontsScript.js"), 'utf8');
        await this.page.evaluate((r) => { (eval(`()=>{ ${r} }`))(); }, script);
    }
}