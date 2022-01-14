const should = require('chai').should()
const {promisify} = require('util')
const {Builder, By, Key} = require("selenium-webdriver")
const sleep= promisify(setTimeout)
//const {Eyes, Target, Configuration, BatchInfo} = require('@applitools/eyes-images')
//const {config} = require("chai");

describe('PresentationModeTesting', function () {
    this.timeout('300s')
    let driver
    let vars
    beforeEach(async function () {
        driver = await new Builder().forBrowser('chrome').build()
        vars = {}
        await driver.get("http://localhost:3000/")
        await driver.manage().window().setRect(839, 864)
    })
    afterEach(async function () {
        await driver.quit();
    })
    it('PresModeTesting', async function(){
        // Generated by Selenium IDE
        await sleep(3000)
        await driver.findElement(By.id("PresModeButton")).click()
        await driver.findElement(By.id("nextButton")).click()
        await driver.findElement(By.id("nextButton")).click()
        await driver.findElement(By.id("nextButton")).click()
        await driver.findElement(By.id("nextButton")).click()
        await driver.findElement(By.id("nextButton")).click()
        await driver.findElement(By.id("nextButton")).click()
        await driver.findElement(By.id("backButton")).click()
    })
});