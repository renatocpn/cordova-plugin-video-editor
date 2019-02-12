module.exports = function(ctx) {
    var fs = ctx.requireCordovaModule( "fs" ),
        path = ctx.requireCordovaModule( "path" ),
        xml = ctx.requireCordovaModule( "cordova-common" ).xmlHelpers,
        et = ctx.requireCordovaModule( "elementtree" );

    var manifestPath = path.join( ctx.opts.projectRoot, "platforms/android/AndroidManifest.xml" );
    var doc = xml.parseElementtreeSync( manifestPath );
 
    if ( doc.getroot().tag !== "manifest" )
    {
        throw new Error( manifestPath + " has incorrect root node name (expected \"manifest\")" );
    }

    var appId = "cordova-plugin-video-editor";
    var appNode = doc.getroot().find( "./application" );

    if ( ! appNode.find( "provider[@android:authorities=\"" + appId + ".provider\"]" ) )
    {
        var child = et.XML(
            "<provider android:name=\"org.apache.cordova.videoeditor.FileProvider\" android:authorities=\"" + appId + ".provider\" android:exported=\"false\" android:grantUriPermissions=\"true\">" +
                "<meta-data android:name=\"android.support.FILE_PROVIDER_PATHS\" android:resource=\"@xml/videoeditor_provider_paths\" />" +
            "</provider>"
        );
        
        xml.graftXML( appNode, [ child ], "./" );
    }

    // Write modified manifest file
    fs.writeFileSync( manifestPath, doc.write(), "utf-8" );
};
