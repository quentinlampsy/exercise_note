#requires -Version 5.1
[CmdletBinding()]
param(
  [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9-]*/[A-Za-z0-9][A-Za-z0-9._-]*$')][string]$Repository,
  [ValidatePattern('^[A-Za-z0-9][A-Za-z0-9._/-]*$')][string]$Branch='main',
  [switch]$CheckOnly
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$PSNativeCommandUseErrorActionPreference=$false
$ProjectRoot=[IO.Path]::GetFullPath($PSScriptRoot)
$Files=@('index.html','package.json','README.md','DEPLOYMENT.md','manifest.webmanifest','sw.js','firebase.json','firestore.rules','firestore.indexes.json','.nojekyll','.gitignore','preview.bat','deploy.ps1','.github/workflows/deploy.yml','workout/icon.svg','workout/icon-192.png','workout/icon-512.png','workout/styles.css','workout/config.js','workout/app.mjs','workout/core.mjs','workout/store.mjs','workout/cloud.mjs','workout/tools/build.cjs','workout/tools/serve.cjs','workout/tools/browser-test.cjs','workout/tests/core.test.mjs')
function Invoke-Native([string]$Executable,[string[]]$Arguments) {
  & $Executable @Arguments
  if($LASTEXITCODE -ne 0){throw "$Executable failed (exit $LASTEXITCODE)."}
}
function Assert-Ordinary([string]$Root,[string]$Relative,[switch]$AllowMissing) {
  $Current=$Root
  foreach($Segment in @('.')+$Relative.Split('/')){
    $Current=Join-Path $Current $Segment
    $Item=Get-Item -LiteralPath $Current -Force -ErrorAction SilentlyContinue
    if(-not $Item){if($AllowMissing){return};throw "Missing file: $Current"}
    if($Item.LinkType -in @('SymbolicLink','Junction')){throw "Upload paths cannot be links: $Current"}
  }
}
try{
  Set-Location -LiteralPath $ProjectRoot
  $Files += 'workout/tests/fake-cloud.mjs'
  $Files += '.firebaserc', 'FIREBASE_SEPARATION.md', 'firestore.workout.rules', 'workout/config.example.js', 'workout/tools/recover.cjs', 'workout/tools/recover.html'
  foreach($File in $Files){Assert-Ordinary $ProjectRoot $File}
  $Node=(Get-Command node -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
  Invoke-Native $Node @('--test','workout/tests/core.test.mjs')
  Invoke-Native $Node @('workout/tools/build.cjs')
  if($CheckOnly){Write-Host 'PASS: FORM tests and public build. No upload performed.';return}
  if(-not $Repository){throw 'Specify -Repository "YOUR_USERNAME/YOUR_WORKOUT_REPOSITORY". There is no default repository. See DEPLOYMENT.md.'}
  if($Repository.Split('/')[1] -like '*.github.io'){throw 'Use a separate workout repository, not a root portfolio repository.'}
  $Git=(Get-Command git -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
  foreach($Variable in @('GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR')){if([Environment]::GetEnvironmentVariable($Variable,'Process')){throw "Use an ordinary terminal without $Variable set."}}
  Invoke-Native $Git @('check-ref-format','--branch',$Branch)
  $Cache=Join-Path $ProjectRoot '.deploy'
  New-Item -ItemType Directory -Path $Cache -Force|Out-Null
  Assert-Ordinary $ProjectRoot '.deploy'
  $Checkout=Join-Path $Cache ([Guid]::NewGuid().ToString('N'))
  Invoke-Native $Git @('clone','--no-tags','--',"https://github.com/$Repository.git",$Checkout)
  $Heads=@(& $Git -C $Checkout for-each-ref '--format=%(refname)' refs/remotes/origin/)
  if($Heads.Count -eq 0){Invoke-Native $Git @('-C',$Checkout,'symbolic-ref','HEAD',"refs/heads/$Branch")}
  else{Invoke-Native $Git @('-C',$Checkout,'checkout',$Branch)}
  foreach($File in $Files){
    Assert-Ordinary $Checkout $File -AllowMissing
    $Destination=Join-Path $Checkout $File
    New-Item -ItemType Directory -Path (Split-Path $Destination -Parent) -Force|Out-Null
    Copy-Item -LiteralPath (Join-Path $ProjectRoot $File) -Destination $Destination -Force
  }
  Invoke-Native $Git (@('-C',$Checkout,'add','--')+$Files)
  $Changes=@(& $Git --no-pager -C $Checkout diff --cached --name-status)
  if($Changes.Count -eq 0){Write-Host 'This source is already uploaded. Run the GitHub publishing workflow when ready.';return}
  $CommitName=(& $Git -C $Checkout config --get user.name)
  $CommitEmail=(& $Git -C $Checkout config --get user.email)
  if(-not $CommitName){$CommitName=Read-Host 'Commit author name';if(-not $CommitName){throw 'An author name is needed.'};Invoke-Native $Git @('-C',$Checkout,'config','user.name',$CommitName)}
  if(-not $CommitEmail){$CommitEmail=Read-Host 'Commit author email (GitHub private commit email is fine)';if(-not $CommitEmail){throw 'An author email is needed.'};Invoke-Native $Git @('-C',$Checkout,'config','user.email',$CommitEmail)}
  Write-Host "Target: $Repository ($Branch)"
  $Changes|ForEach-Object{Write-Host $_}
  if($Repository -eq 'quentinlampsy/zzz_calendar'){Write-Host 'You selected the existing calendar repository. Publishing FORM there replaces its entry page.'}
  $Answer=Read-Host 'Type UPLOAD to push these FORM source files, or press Enter to cancel'
  if($Answer -cne 'UPLOAD'){Write-Host 'Upload cancelled. Prepared checkout remains inside .deploy.';return}
  Invoke-Native $Git @('-C',$Checkout,'commit','-m','Update FORM workout journal')
  Invoke-Native $Git @('-C',$Checkout,'push','origin',"HEAD:$Branch")
  Write-Host "Uploaded. Open https://github.com/$Repository/actions and run Publish FORM workout journal."
}catch{Write-Error $_;exit 1}
