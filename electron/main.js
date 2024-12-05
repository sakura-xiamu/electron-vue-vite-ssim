const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const sharp = require('sharp')

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // 开发环境下加载本地服务
    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL)
        win.webContents.openDevTools()
    } else {
        // 生产环境下加载打包后的文件
        win.loadFile(path.join(__dirname, '../dist/index.html'))
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// 处理图片相似度比较
ipcMain.handle('compare-images', async (event, { image1Path, image2Path }) => {
    try {
        // 计算第一张图片的 pHash
        const hash1 = await calculatePHash(image1Path)
        // 计算第二张图片的 pHash
        const hash2 = await calculatePHash(image2Path)
        // 计算汉明距离
        const similarity = calculateSimilarity(hash1, hash2)

        return {
            success: true,
            similarity,
            hash1,
            hash2
        }
    } catch (error) {
        return {
            success: false,
            error: error.message
        }
    }
})

async function calculatePHash(imagePath) {
    try {
        const image = sharp(imagePath)

        // 调整图片大小为32x32并转为灰度
        const { data } = await image
            .resize(32, 32, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer()

        // 计算平均值
        const average = data.reduce((sum, val) => sum + val, 0) / data.length

        // 生成hash
        let hash = ''
        data.forEach(pixel => {
            hash += pixel >= average ? '1' : '0'
        })

        return hash
    } catch (error) {
        throw new Error(`处理图片失败: ${error.message}`)
    }
}

function calculateSimilarity(hash1, hash2) {
    let distance = 0
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) {
            distance++
        }
    }
    // 1024是hash长度（32x32），将汉明距离转换为相似度百分比
    return Math.round((1 - distance / 1024) * 100)
}
