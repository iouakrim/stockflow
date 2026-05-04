const escpos = require('escpos');
escpos.USB = require('escpos-usb');

try {
    console.log("Recherche d'imprimantes USB...");
    const devices = escpos.USB.findPrinter();
    
    if (devices.length === 0) {
        console.log("❌ Aucune imprimante Epson USB détectée.");
    } else {
        console.log(`✅ ${devices.length} imprimante(s) trouvée(s) :`);
        devices.forEach((d, index) => {
            console.log(`\n[Imprimante ${index + 1}]`);
            console.log(`- VendorID: 0x${d.deviceDescriptor.idVendor.toString(16)}`);
            console.log(`- ProductID: 0x${d.deviceDescriptor.idProduct.toString(16)}`);
        });

        // On tente d'utiliser la première trouvée
        const device = new escpos.USB();
        const printer = new escpos.Printer(device);
        
        console.log("\nTentative d'ouverture du port USB...");
        device.open((err) => {
            if (err) {
                console.error("❌ Impossible d'ouvrir le port USB :", err.message);
                if (err.message.includes('can\'t set config') || err.message.includes('claim interface')) {
                    console.log("\n💡 ASTUCE : L'imprimante est probablement occupée par macOS.");
                    console.log("Essayez de la supprimer des 'Réglages Système > Imprimantes' puis relancez ce script.");
                }
                return;
            }
            
            console.log("🚀 Connexion établie ! Envoi du test d'impression...");
            printer
                .font('a')
                .align('ct')
                .style('bu')
                .size(2, 2)
                .text('TEST REUSSI !')
                .size(1, 1)
                .text('------------------------------')
                .text('Imprimante : Epson M129H')
                .text('Piloté par Node.js sur Mac')
                .text(new Date().toLocaleString())
                .text('------------------------------')
                .feed(3)
                .cut()
                .close(() => {
                    console.log("✅ Impression terminée et port fermé.");
                    process.exit();
                });
        });
    }
} catch (e) {
    console.error("❌ Erreur fatale :", e);
}
