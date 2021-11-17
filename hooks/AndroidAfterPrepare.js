var fs = require( "fs" );

module.exports = function(ctx) {
    var path = ctx.requireCordovaModule( "path" ),
        xml = ctx.requireCordovaModule( "cordova-common" ).xmlHelpers,
        et = ctx.requireCordovaModule( "elementtree" );

    var manifestPath = null;

    var platformPaths = [
        "platforms/android/AndroidManifest.xml",
        "platforms/android/app/src/main/AndroidManifest.xml"
    ];

    for( var i = 0; i < platformPaths.length; i++ ) {
        var currentPath = path.join( ctx.opts.projectRoot, platformPaths[ i ] );

        if ( fs.existsSync( currentPath ) ) {
            manifestPath = currentPath;
            break;
        }
    }

    if ( manifestPath !== null ) {
        var doc = xml.parseElementtreeSync( manifestPath );
     
        if ( doc.getroot().tag !== "manifest" ) {
            throw new Error( manifestPath + " has incorrect root node name (expected \"manifest\")" );
        }

        var appId = "cordova-plugin-video-editor";
        var appNode = doc.getroot().find( "./application" );

        if ( ! appNode.find( "provider[@android:authorities=\"" + appId + ".provider\"]" ) ) {
            var child = et.XML(
                "<provider android:name=\"org.apache.cordova.videoeditor.FileProvider\" android:authorities=\"" + appId + ".provider\" android:exported=\"false\" android:grantUriPermissions=\"true\">" +
                    "<meta-data android:name=\"android.support.FILE_PROVIDER_PATHS\" android:resource=\"@xml/videoeditor_provider_paths\" />" +
                "</provider>"
            );
            
            xml.graftXML( appNode, [ child ], "./" );
        }

        // Write modified manifest file
        fs.writeFileSync( manifestPath, doc.write(), "utf-8" );
    }
    
};
