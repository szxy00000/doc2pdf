### koa-quickstart

安装依赖： ```yarn start```

本地调试： ```npm run dev```

测试环境： ```npm run build-pre```

线上环境： ```npm run build```

### 线上及测试环境安装依赖：
 - node依赖：  npm install
 - jpg依赖
		yum install -y libpng-devel
		yum install -y libjpeg-turbo-devel
		yum install -y libtool-ltdl-devel
 - 转换依赖： 通过下载方式下载(https://www.imagemagick.org/script/install-source.php#unix)，下载后执行如下操作：
	./configure --enable-shared --enable-threads=posix --with-system-zlib --enable-__cxa_atexit --disable-openmp  --with-bzlib=yes --with-fontconfig=yes --with-freetype=yes --with-gslib=yes --with-gvc=yes --with-jpeg=yes --with-jp2=yes --with-png=yes --with-tiff=yes 
	make && make install
 - 文档依赖 
		unoconv http://dag.wieers.com/home-made/unoconv/unoconv-0.7.tar.gz
		libreOffice http://mirrors.ustc.edu.cn/tdf/libreoffice/stable/6.0.4/rpm/x86_64/ 中的
		LibreOffice_6.0.4_Linux_x86-64_rpm_langpack_zh-CN.tar.gz
		LibreOffice_6.0.4_Linux_x86-64_rpm_sdk.tar.gz
		LibreOffice_6.0.4_Linux_x86-64_rpm.tar.gz
 - 安装docker
	yum -y install docker-io

#####使用方法： convert xxx.pdf xxx.png

