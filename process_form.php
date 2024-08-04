<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $filename = $_POST["filename"];

    if (!empty($filename)) {
        $directory = './vrScript_files/';
        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        $filepath = $directory . $filename . ".vrScript";
        $content = "";

        $numberOfTrials = count($_POST["TRIAL_NAME"]);

        $externalFile = "./fixed.txt";
        $externalContent = "";
        if (file_exists($externalFile)) {
            $externalContent = file_get_contents($externalFile);
        } else {
            echo "External file 'fixed.txt' not found.";
            exit;
        }

        for ($i = 0; $i < $numberOfTrials; $i++) {
            foreach ($_POST as $key => $value) {
                if ($key !== 'filename') {
                    if (is_array($value)) {
                        $currentValue = isset($value[$i]) ? $value[$i] : '';
                    } else {
                        $currentValue = $value;
                    }

                    if (strpos($key, '_other') !== false) {
                        $originalKey = str_replace('_other', '', $key);
                        $content .= $originalKey . " " . $currentValue . "\n";
                    } else {
                        $content .= $key . " " . $currentValue . "\n";
                    }
                }
            }

            if (!empty($externalContent)) {
                $content .= $externalContent . "\n";
            }
            $content .= "\nNEXT_TEST\n";
        }
    }

    if (file_put_contents($filepath, $content) !== false) {
        echo "File created successfully.";
    } else {
        echo "Error creating the file.";
    }
} else {
    echo "Filename is required.";
}