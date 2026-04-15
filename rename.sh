#!/bin/bash
# 用法: ./rename.sh <新项目名> (例如: ./rename.sh MyAwesomeApp)

if [ -z "$1" ]; then
  echo "❌ 错误: 请提供新的项目名称！"
  echo "💡 用法: ./rename.sh <NewProjectName>"
  exit 1
fi

OLD_NAME="MAUITemplate"
NEW_NAME=$1

# 解决 macOS sed 遇到非 UTF-8 二进制文件时报 "illegal byte sequence" 的问题
export LC_ALL=C

# 转换为小写，用于替换 ApplicationId (如 com.companyname.mauitemplate.app)
OLD_NAME_LOWER="mauitemplate"
NEW_NAME_LOWER=$(echo "$NEW_NAME" | tr '[:upper:]' '[:lower:]')

echo "🚀 开始将项目 $OLD_NAME 重命名为 $NEW_NAME ..."

# 1. 替换所有代码和配置中的字符串
# 忽略 .git, node_modules, bin, obj, dist 等目录，防止误改和提速
find . -type f \
  -not -path "*/.git/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/bin/*" \
  -not -path "*/obj/*" \
  -not -path "*/dist/*" \
  -not -name "rename.sh" \
  -not -name "*.png" \
  -not -name "*.jpg" \
  -exec sed -i '' "s/$OLD_NAME/$NEW_NAME/g" {} \; \
  -exec sed -i '' "s/$OLD_NAME_LOWER/$NEW_NAME_LOWER/g" {} \;

# 2. 重命名包含旧名字的文件夹和文件 (-)
# 使用 -depth 从底层(叶子节点)向顶层重命名，避免父目录重命名导致子目录路径失效
find . -depth -name "*$OLD_NAME*" \
  -not -path "*/.git/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/bin/*" \
  -not -path "*/obj/*" | while read -r path; do
    dir=$(dirname "$path")
    base=$(basename "$path")
    new_base=${base//$OLD_NAME/$NEW_NAME}
    mv "$path" "$dir/$new_base"
done

echo "✅ 替换与重命名完成！"
echo "----------------------------------------"
echo "下一步建议操作："
echo "1. 删掉旧的缓存并重新安装依赖："
echo "   rm -rf src/*/bin src/*/obj src/*/node_modules src/*/dist"
echo "   cd src/${NEW_NAME}.Web && npm install"
echo "2. 使用 Visual Studio / VS Code 重新打开 ${NEW_NAME}.sln 编译运行。"
echo "----------------------------------------"