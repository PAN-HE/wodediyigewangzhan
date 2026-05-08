# 部署脚本：在已安装 Git 的 Windows 环境中运行
# 1. 打开 PowerShell
# 2. 进入项目目录
# 3. 运行： .\deploy.ps1 -GitHubRepoUrl 'https://github.com/yourname/yourrepo.git'

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubRepoUrl
)

Write-Host "初始化本地 Git 仓库..."

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: 未检测到 git，请先安装 Git 并确保其在 PATH 中。" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path .git)) {
    git init
    Write-Host "已初始化 Git 仓库。"
} else {
    Write-Host "本地 Git 仓库已存在。"
}

Write-Host "创建首次提交..."
git add .
git commit -m "Initial commit: 蔡司三坐标网站项目"

Write-Host "添加远程仓库： $GitHubRepoUrl"
git remote remove origin 2>$null
if ($LASTEXITCODE -ne 0) { }
git remote add origin $GitHubRepoUrl

Write-Host "推送到 GitHub..."
git branch -M main
git push -u origin main

Write-Host "部署完成！现在你可以访问 GitHub 仓库查看代码。" -ForegroundColor Green
