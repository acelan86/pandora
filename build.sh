#### author:acelan(xiaobin8@staff.sina.com.cn)
#### date:20120501
#### adbox fe build script 
###### init environment variable
JAVA_HOME=$JAVA_HOME_1_5
export JAVA_HOME
PATH=$JAVA_HOME/bin:$PATH
export PATH

ADBOX_PATH='./';
###### init env

###### init tools path
yuitool="build/yuicompressor-2.4.2.jar"
webpacker="build/webpacker-1.5.0.jar"
appname="  新浪功能广告平台  "
indexfile=${ADBOX_PATH}"main.release.html"


###### clear debug info
grep -v "\[__debug__\]" "main.html" > "main.html.tmp"
mv "main.html.tmp" "${indexfile}"

#### build css
css_file="assets/pandora.all.css"
css_file_pack=${ADBOX_PATH}"assets/pandora.pack.css"

sed "s/\.\.\///g" "assets/pandora.css" > "assets/pandora.css.tmp"
cat assets/pandora.css.tmp | grep ".css" | awk -F"'" '{print $2}' | xargs cat > "${css_file}"
rm "assets/pandora.css.tmp"
java -jar "${yuitool}" --type css --charset utf-8 -o "${css_file_pack}" "${css_file}"

#### build js
js_file="assets/pandora.all.js"
js_file_pack=${ADBOX_PATH}"assets/pandora.pack.js"

cat assets/pandora.js | grep ".js" | awk -F'"' '{print $2}' | xargs cat > "${js_file}.tmp"

### remove console.debug & console.log
sed "s/console\./\/\//g" "${js_file}.tmp" > "${js_file}"
rm -f "${js_file}.tmp"

java -jar "${yuitool}" "${js_file}" --charset utf-8 -o "${js_file_pack}"

### cp images simudata
cp -rf src/css/img/* ${ADBOX_PATH}"assets/img/"


