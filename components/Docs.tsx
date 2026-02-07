
import React, { useState } from 'react';

interface DocItem {
  name: string;
  content: string;
  code?: string;
  params?: string;
}

interface DocSection {
  id: string;
  title: string;
  items: DocItem[];
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: 'general',
    title: 'Avion General Use',
    items: [
      {
        name: 'UI Guide',
        content: "Avion features a minimalist layout designed for efficiency.\n\nWindow Navigation:\n1 – Sidebar Collapse Button: Hides or shows the sidebar/menu for more workspace.\n2 – Dashboard Page Button: Navigates to the Dashboard page.\n3 – Editor Page Button: Navigates to the Editor page.\n4 – Scripthub Page Button: Navigates to the Script Hub page.\n5 – Settings Page Button: Navigates to the Settings page.\n6 – Minimize Button: Minimizes Avion's interface.\n7 – Maximize Button: Expands Avion's interface.\n8 – Close Button: Closes Avion's interface completely.\n\nEditor Page:\n1 – Script List: The workspace folder contains saved or favorite scripts.\n2 – Tab Area: Displays open script tabs.\n3 – Create Script Tab: Opens a new tab for your script.\n4 – Lua Console: Shows errors or output from the active tab.\n5 – Injection Status: Red means not injected; green means injected.\n6 – Execute: Runs the script in the active tab.\n7 – Clear: Clears the editor content.\n8 – Open File: Load a .txt or .lua file.\n9 – Save File: Save the current script.\n10 – Inject Avion: Inject into an active Roblox instance."
      },
      {
        name: 'Installation',
        content: 'Follow these steps to get Avion running:\n\n1. Download the launcher from your dashboard.\n2. Disable Windows Real-time Protection momentarily (or add Avion to exclusions).\n3. Run the installer as Administrator.\n4. Login with your credentials.\n5. Click "Inject" when inside a supported game.'
      },
      {
        name: 'Common Fixes',
        content: 'Struggling with issues? Try these:\n\n- Injection fails: Ensure you have the latest VC++ Redistributables installed.\n- Blank UI: Clear your %localappdata%/Avion folder and restart.\n- Script errors: Check the Lua Console for detailed error messages.\n- Performance: Try disabling "Hardware Acceleration" in settings if applicable.'
      },
      {
        name: 'Scripthub',
        content: "Avion's Scripthub allows you to find and load scripts for your favorite games instantly. Simply browse the list, search for a game title, and click 'Load' to bring the script into your editor."
      }
    ]
  },
  {
    id: 'actors',
    title: 'Actors',
    items: [
      {
        name: 'getactors()',
        content: 'Returns a list of actors you can execute in.',
        code: '-- Loop through all actors and print them\nfor index, actor in getactors() do \n    print(index, actor)\nend'
      },
      {
        name: 'run_on_actor()',
        content: 'Runs a script on an actor thread. You cannot pass types like tables or functions as they are from a different Lua VM.',
        code: 'run_on_actor(getactors()[1], [[\n    print("Hello from actor thread!")\n]])'
      },
      {
        name: 'get_comm_channel()',
        content: 'Returns an existing communication channel.',
        code: 'local channel = get_comm_channel(1)\nprint(channel)'
      },
      {
        name: 'create_comm_channel()',
        content: 'Returns a channel and ID for data transfer between the actor state and your state.',
        code: 'local id, channel = create_comm_channel()\nprint(id, channel)'
      },
      {
        name: 'run_on_thread()',
        content: 'Runs a script on the first available actor thread (only works if actors are present).',
        code: 'run_on_thread(getactorthreads()[1], [[\n    print("Hello, world!")\n]])'
      },
      {
        name: 'getactorthreads()',
        content: 'Returns a list of threads you can execute in.',
        code: 'for index, thread in getactorthreads() do \n    print(index, thread)\nend'
      }
    ]
  },
  {
    id: 'bit',
    title: 'Bit',
    items: [
      { name: 'bit.badd', content: 'Performs a bitwise addition on multiple numbers.', code: 'local result = bit.badd(1, 2, 3)' },
      { name: 'bit.bsub', content: 'Subtracts multiple numbers bitwise, starting from the first number.', code: 'local result = bit.bsub(10, 3, 2)' },
      { name: 'bit.bmul', content: 'Multiplies multiple numbers bitwise.', code: 'local result = bit.bmul(2, 3, 4)' },
      { name: 'bit.bdiv', content: 'Divides multiple numbers bitwise, starting from the first number.', code: 'local result = bit.bdiv(100, 2, 5)' },
      { name: 'bit.band', content: 'Performs a bitwise AND operation on all input numbers.', code: 'local result = bit.band(0xFF, 0xF0)' },
      { name: 'bit.bor', content: 'Performs a bitwise OR operation on all input numbers.', code: 'local result = bit.bor(0x0F, 0xF0)' },
      { name: 'bit.bxor', content: 'Performs a bitwise XOR operation on all input numbers.', code: 'local result = bit.bxor(0xFF, 0x0F)' },
      { name: 'bit.bnot', content: 'Performs a bitwise NOT operation on the input number.', code: 'local result = bit.bnot(0xF)' },
      { name: 'bit.lshift', content: 'Performs a left shift operation.', code: 'local result = bit.lshift(1, 4)' },
      { name: 'bit.rshift', content: 'Performs a logical right shift operation.', code: 'local result = bit.rshift(16, 2)' },
      { name: 'bit.arshift', content: 'Performs an arithmetic right shift operation.', code: 'local result = bit.arshift(-8, 1)' },
      { name: 'bit.rol', content: 'Performs a left rotate operation.', code: 'local result = bit.rol(0x12345678, 4)' },
      { name: 'bit.ror', content: 'Performs a right rotate operation.', code: 'local result = bit.ror(0x12345678, 4)' },
      { name: 'bit.bswap', content: 'Swaps the bytes in the input value.', code: 'local swapped = bit.bswap(0x12345678)' },
      { name: 'bit.tohex', content: 'Converts a number to its hexadecimal representation.', code: 'local hex = bit.tohex(0xABCD, 4)' },
      { name: 'bit.tobit', content: 'Converts a number to a 32-bit integer.', code: 'local int32 = bit.tobit(0xFFFFFFFF)' }
    ]
  },
  {
    id: 'cache',
    title: 'Cache',
    items: [
      { name: 'cache.invalidate', content: 'Removes object from the Instance cache, invalidating it as a reference.', code: 'local Lighting = game:GetService("Lighting")\ncache.invalidate(Lighting)\nprint(Lighting, Lighting == game:GetService("Lighting")) -- > Lighting, false' },
      { name: 'cache.iscached', content: 'Checks whether object exists in the Instance cache.', code: 'local Lighting = game:GetService("Lighting")\ncache.invalidate(Lighting)\nprint(cache.iscached(Lighting)) -- > false' },
      { name: 'cache.replace', content: 'Replaces object in the Instance cache with newObject.', code: 'local Lighting = game:GetService("Lighting")\nlocal Players = game:GetService("Players")\ncache.replace(Lighting, Players)\nprint(Lighting) -- > Players' },
      { name: 'cloneref', content: 'Returns a copy of the Instance reference to object. Useful for managing an Instance without directly referencing it.', code: 'local Lighting = game:GetService("Lighting")\nlocal LightingClone = cloneref(Lighting)\nprint(Lighting == LightingClone) -- > false' },
      { name: 'compareinstances', content: 'Returns whether objects a and b both reference the same Instance.', code: 'local Lighting = game:GetService("Lighting")\nlocal LightingClone = cloneref(Lighting)\nprint(compareinstances(Lighting, LightingClone)) -- > true' }
    ]
  },
  {
    id: 'crypt',
    title: 'Crypt',
    items: [
      {
        name: 'crypt.encrypt',
        content: 'Encrypts data using the specified key and method.',
        params: 'data (string) - The content to encrypt\nkey (string) - The encryption key\niv (string) - Initialization vector\nmode (string) - Encryption mode (e.g., "cbc", "gcm")',
        code: 'local encrypted = crypt.encrypt("secret message", "my-key", "my-iv", "cbc")\nprint(encrypted)'
      },
      {
        name: 'crypt.decrypt',
        content: 'Decrypts data using the specified key and method.',
        params: 'data (string) - The encrypted content\nkey (string) - The encryption key\niv (string) - Initialization vector\nmode (string) - Encryption mode',
        code: 'local decrypted = crypt.decrypt(encrypted_data, "my-key", "my-iv", "cbc")\nprint(decrypted)'
      },
      {
        name: 'crypt.base64encode',
        content: 'Encodes a string into Base64 format.',
        params: 'data (string) - The string to encode',
        code: 'local encoded = crypt.base64encode("Hello World")\nprint(encoded) -- > SGVsbG8gV29ybGQ='
      },
      {
        name: 'crypt.base64decode',
        content: 'Decodes a Base64 encoded string.',
        params: 'data (string) - The Base64 string to decode',
        code: 'local decoded = crypt.base64decode("SGVsbG8gV29ybGQ=")\nprint(decoded) -- > Hello World'
      },
      {
        name: 'crypt.hash',
        content: 'Computes a hash of the input data using the specified algorithm.',
        params: 'data (string) - The content to hash\nalgorithm (string) - Algorithm name (e.g., "sha256", "md5")',
        code: 'local hashed = crypt.hash("some data", "sha256")\nprint(hashed)'
      },
      {
        name: 'crypt.generatekey',
        content: 'Generates a random encryption key.',
        code: 'local key = crypt.generatekey()\nprint(key)'
      },
      {
        name: 'crypt.generatebytes',
        content: 'Generates a string of random bytes with the specified length.',
        params: 'length (number) - Number of bytes to generate',
        code: 'local bytes = crypt.generatebytes(32)\nprint(bytes)'
      }
    ]
  },
  {
    id: 'closures',
    title: 'Closures',
    items: [
      {
        name: 'checkcaller()',
        content: 'Returns whether the currently running function was called by Avion. Useful for metamethod hooks.',
        code: 'if checkcaller() then\n    print("Called by Avion!")\nend'
      },
      {
        name: 'clonefunction',
        content: 'Returns a recreated version of func.',
        params: 'func - The function to recreate.',
        code: 'local function adaa()\n    print("Hello, world!")\nend\nlocal bar = clonefunction(adaa)\nadaa() --> Hello, world!\nbar() --> Hello, world!\nprint(adaa == bar) --> false'
      },
      {
        name: 'getcallingscript',
        content: 'Returns the script responsible for the currently running function.',
        code: 'local caller = getcallingscript()\nprint(caller.Name)'
      },
      {
        name: 'restorefunction',
        content: 'Restores a previously hooked function to its original state.',
        params: 'func - The function to restore.',
        code: 'restorefunction(print)\nprint("Restored!")'
      },
      {
        name: 'isfunctionhooked',
        content: 'Returns true if func has been hooked by a prior hookfunction call.',
        params: 'func - The function to check.',
        code: 'print(isfunctionhooked(print))'
      },
      {
        name: 'isnewcclosure',
        content: 'Returns true if func is the result of a newcclosure call.',
        params: 'func - The function to check.',
        code: 'local b = newcclosure(function() end)\nprint(isnewcclosure(b))'
      },
      {
        name: 'hookfunction()',
        content: 'Replaces func internally with hook, returning a reference to the original function.',
        params: 'func - The function to hook\nhook - The function to redirect calls to.',
        code: 'local old\nold = hookfunction(print, function(...)\n    return old("Intercepted:", ...)\nend)\n\nprint("Hello") -- Intercepted: Hello'
      },
      {
        name: 'iscclosure',
        content: 'Returns true if func is a C closure.',
        params: 'func - The function to check.',
        code: 'print(iscclosure(print))'
      },
      {
        name: 'islclosure',
        content: 'Returns true if func is a Luau closure.',
        params: 'func - The function to check.',
        code: 'print(islclosure(function() end))'
      },
      {
        name: 'isexecutorclosure',
        content: 'Returns true if func was created by Avion.',
        params: 'func - The function to check.',
        code: 'print(isexecutorclosure(print))'
      },
      {
        name: 'loadstring()',
        content: 'Generates a chunk from source code. Returns the function if successful; otherwise nil plus an error message.',
        params: 'source - Source code to compile\nchunkname - Optional name of the chunk.',
        code: 'local func, err = loadstring("print(\'Hello world\')")\nif func then func() end'
      },
      {
        name: 'newcclosure()',
        content: 'Returns a C closure that wraps func. Identifies as a C closure with optional debugname.',
        params: 'func - Function to wrap\ndebugname - Optional debugname.',
        code: 'local wrapped = newcclosure(function()\n    print("I am now a C closure")\nend)'
      },
      {
        name: 'newlclosure',
        content: 'Returns a Luau closure that wraps func without upvalues. Identifies as a L closure.',
        params: 'func - Function to wrap\ndebugname - Optional debugname.',
        code: 'local bar = newlclosure(pairs)\nprint(islclosure(bar))'
      }
    ]
  },
  {
    id: 'console',
    title: 'Console',
    items: [
      { name: 'rconsolecreate', content: 'Creates a blank console.', code: 'rconsolecreate()' },
      {
        name: 'rconsoleprint',
        content: 'Prints a colored message to the console.',
        params: 'message (string) - The message to print\ncolour (string) - The color name (e.g., "green", "red")',
        code: 'rconsoleprint("Hello World", "green")'
      },
      {
        name: 'rconsolesettitle',
        content: 'Sets the console\'s title.',
        params: 'title (string) - The new title',
        code: 'rconsolesettitle("My Console")'
      },
      { name: 'rconsoleinput', content: 'Allows the user to type input into the console, then returns it.', code: 'local input = rconsoleinput()\nprint(input)' },
      { name: 'rconsoleclear', content: 'Clears the console.', code: 'rconsoleclear()' },
      { name: 'rconsoledestroy', content: 'Destroys the console.', code: 'rconsoledestroy()' }
    ]
  },
  {
    id: 'drawing',
    title: 'Drawing',
    items: [
      {
        name: 'Drawing.new()',
        content: 'Creates a new drawing object of the specified type ("Line", "Circle", "Square", "Triangle", "Quad", "Text", or "Image").',
        params: 'type (string) - The type of object\ncollect (boolean?) - Optional, whether to automatically collect.',
        code: 'local circle = Drawing.new("Circle")\ncircle.Position = Vector2.new(200, 200)\ncircle.Radius = 50\ncircle.Color = Color3.new(1, 0, 0)\ncircle.Visible = true'
      },
      { name: 'Drawing.clear()', content: 'Clears all existing drawing objects.', code: 'Drawing.clear()' },
      {
        name: 'Drawing Fonts',
        content: 'Available fonts for text drawing objects:\nDrawing.Fonts.UI - UI font\nDrawing.Fonts.System - System font\nDrawing.Fonts.Plex - Plex font\nDrawing.Fonts.Monospace - Monospace font'
      },
      {
        name: 'Drawing Properties',
        content: 'Common properties for DrawingObjects:\nVisible (boolean) - Visibility\nZIndex (number) - Rendering order\nTransparency (number) - Transparency (0-1)\nColor (Color3) - Object color\nRemove() (function) - Removes the object'
      },
      {
        name: 'getrenderproperty',
        content: 'Returns the value of a property for a drawing object.',
        params: 'object (DrawingObject) - The target object\nproperty (string) - The property name',
        code: 'local color = getrenderproperty(myLine, "Color")'
      },
      {
        name: 'setrenderproperty',
        content: 'Sets the value of a property for a drawing object.',
        params: 'object (DrawingObject) - The target object\nproperty (string) - The property name\nvalue (any) - The new value',
        code: 'setrenderproperty(myCircle, "Radius", 50)'
      }
    ]
  },
  {
    id: 'debug',
    title: 'Debug',
    items: [
      {
        name: 'debug.getconstant',
        content: 'Returns the constant at a specified index in a function or stack level. Errors if the constant does not exist.',
        params: 'func (function | number) - The function or stack level\nindex (number) - The index of the constant to retrieve',
        code: 'local function adaa()\n    print("Hello, world!")\nend\n\nprint(debug.getconstant(adaa, 1)) --> "print"\nprint(debug.getconstant(adaa, 3)) --> "Hello, world!"'
      },
      {
        name: 'debug.getconstants',
        content: 'Returns all constants of a function or stack level as a table.',
        params: 'func (function | number) - The function or stack level',
        code: 'local function adaa()\n    local num = 5000 .. 50000\n    print("Hello, world!", num, warn)\nend\n\nfor i, v in pairs(debug.getconstants(adaa)) do\n    print(i, v)\nend'
      },
      {
        name: 'debug.getinfo',
        content: 'Returns debug information about a function or stack level.\n\nFields include: source, short_src, func, what, currentline, name, nups, numparams, is_vararg.',
        params: 'func (function | number) - The function or stack level',
        code: 'local function adaa()\n    print("Hello, world!")\nend\n\nfor k, v in pairs(debug.getinfo(adaa)) do\n    print(k, v, "(" .. type(v) .. ")")\nend'
      },
      {
        name: 'debug.setconstant',
        content: 'Sets a constant at a specified index for a function or stack level.',
        params: 'func (function | number) - The function or stack level\nindex (number) - The index of the constant to set\nvalue (any) - The new value',
        code: 'local function adaa()\n    print("Hello, world!")\nend\ndebug.setconstant(adaa, 3, "Goodbye, world!")\nadaa() --> Prints: Goodbye, world!'
      },
      {
        name: 'debug.getproto',
        content: 'Returns the proto at a specific index in the proto table of a function or stack level.',
        params: 'func (function | number) - The function or stack level\nindex (number) - The proto index\nactive (boolean?) - Optional, return active closures if true',
        code: 'local function adaa()\n    local function bar() end\n    return bar\nend\n\nlocal proto = debug.getproto(adaa, 1)\nprint(type(proto)) --> "function"'
      },
      {
        name: 'debug.getprotos',
        content: 'Returns a table containing all protos of a function or stack level.',
        params: 'func (function | number) - The function or stack level',
        code: 'local function adaa()\n    local function bar() end\n    local function baz() end\nend\n\nlocal protos = debug.getprotos(adaa)\nprint(#protos) --> 2'
      },
      {
        name: 'debug.getstack',
        content: 'Returns values from a stack frame at a given level. Returns a table if no index is provided.',
        params: 'level (number) - Stack level\nindex (number?) - Optional, value index',
        code: 'local function adaa()\n    local a, b = 1, 2\n    print(debug.getstack(1))    --> {1, 2}\n    print(debug.getstack(1, 2)) --> 2\nend\nadaa()'
      },
      {
        name: 'debug.setstack',
        content: 'Sets a value at a specific index in a stack frame at a given level.',
        params: 'level (number) - Stack level\nindex (number) - Value index\nvalue (any) - New value to set',
        code: 'local function adaa()\n    local a = 1\n    debug.setstack(1, 1, 10)\n    print(a) --> 10\nend\nadaa()'
      },
      {
        name: 'debug.getupvalue',
        content: 'Returns the upvalue at a specific index for a function or stack level.',
        params: 'func (function | number) - Function or stack level\nindex (number) - Index of the upvalue',
        code: 'local x = 10\nlocal function adaa()\n    print(x)\nend\nprint(debug.getupvalue(adaa, 1)) --> 10'
      },
      {
        name: 'debug.getupvalues',
        content: 'Returns a table containing all upvalues of a function or stack level.',
        params: 'func (function | number) - Function or stack level',
        code: 'local x, y = 10, 20\nlocal function adaa()\n    print(x, y)\nend\nlocal upvalues = debug.getupvalues(adaa)'
      },
      {
        name: 'debug.setupvalue',
        content: 'Sets the upvalue at a specific index for a function or stack level.',
        params: 'func (function | number) - Function or stack level\nindex (number) - Index of the upvalue\nvalue (any) - New value',
        code: 'local x = 10\nlocal function adaa()\n    print(x)\nend\ndebug.setupvalue(adaa, 1, 20)\nadaa() --> Prints: 20'
      },
      {
        name: 'debug.getregistry',
        content: 'Returns the Lua registry table.',
        code: 'local registry = debug.getregistry()\nprint(type(registry)) --> "table"'
      }
    ]
  },
  {
    id: 'filesystem',
    title: 'Filesystem',
    items: [
      {
        name: 'appendfile',
        content: 'Appends data to an existing file.',
        params: 'path (string) - File path relative to workspace\ndata (string) - Data to append',
        code: 'appendfile("log.txt", "New log entry\\n")'
      },
      {
        name: 'readfile()',
        content: 'Reads the contents of a file relative to the workspace.',
        params: 'path (string) - File path relative to workspace',
        code: 'local content = readfile("config.txt")\nprint(content)'
      },
      {
        name: 'listfiles()',
        content: 'Lists files and directories in a folder.',
        params: 'path (string) - Folder path relative to workspace',
        code: 'for _, path in pairs(listfiles("")) do\n    print(path)\nend'
      },
      {
        name: 'writefile()',
        content: 'Writes data to a file, creating it if needed or overwriting existing content.',
        params: 'path (string) - File path relative to workspace\ndata (string) - Data to write',
        code: 'writefile("hello.txt", "Hello from Avion!")'
      },
      {
        name: 'makefolder',
        content: 'Creates a new directory.',
        params: 'path (string) - Folder path relative to workspace',
        code: 'makefolder("new_directory")'
      },
      {
        name: 'isfile',
        content: 'Checks if a path points to a file.',
        params: 'path (string) - Path relative to workspace',
        code: 'if isfile("data.txt") then print("is file") end'
      },
      {
        name: 'isfolder',
        content: 'Checks if a path points to a folder.',
        params: 'path (string) - Path relative to workspace',
        code: 'if isfolder("data") then print("is folder") end'
      },
      {
        name: 'delfile',
        content: 'Deletes a file.',
        params: 'path (string) - File path relative to workspace',
        code: 'delfile("old_config.txt")'
      },
      {
        name: 'delfolder',
        content: 'Deletes a folder and its contents.',
        params: 'path (string) - Folder path relative to workspace',
        code: 'delfolder("old_data")'
      }
    ]
  },
  {
    id: 'http',
    title: 'HTTP',
    items: [
      {
        name: 'httpget',
        content: 'Performs an asynchronous HTTP GET request.',
        params: 'url (string) - The URL to send the request to.',
        code: 'local response = httpget("https://example.com")\nprint(response)'
      },
      {
        name: 'httppost',
        content: 'Performs an asynchronous HTTP POST request.',
        params: 'url (string) - The URL to send the request to.\ndata (string) - The request body data.\ncontent_type (string, optional) - Content type of the request (default: "/").',
        code: 'local response = httppost("https://example.com/api", "key=value")'
      },
      {
        name: 'request',
        content: 'Performs an asynchronous HTTP request with full control over parameters.',
        params: 'options (table) - Options table fields:\nUrl (string, Required) - Target URL\nMethod (string) - HTTP method (default: GET)\nHeaders (table) - Request headers\nBody (string) - Request body\nCookies (table) - Cookies to send\n\nResponse table fields:\nSuccess (boolean) - True if status 200-299\nStatusCode (number) - HTTP status code\nStatusMessage (string) - Status message\nHeaders (table) - Response headers\nBody (string) - Response body',
        code: 'local response = request({\n    Url = "https://example.com/api",\n    Method = "POST",\n    Headers = {["Content-Type"] = "application/json"},\n    Body = \'{"key":"value"}\'\n})\nprint(response.Body)'
      }
    ]
  },
  {
    id: 'input',
    title: 'Input',
    items: [
      {
        name: 'keypress',
        content: 'Simulate key press.',
        params: 'keycode (number) - The virtual key code to press (e.g., 0x41 for \'A\')',
        code: 'keypress(0x41) -- Pressing \'A\' Key'
      },
      {
        name: 'keyrelease',
        content: 'Simulate key release.',
        params: 'keycode (number) - The virtual key code to release',
        code: 'keyrelease(0x41) -- Releasing \'A\' Key'
      }
    ]
  },
  {
    id: 'instance',
    title: 'Instance',
    items: [
      {
        name: 'gethui',
        content: 'Returns a hidden GUI container for your UI elements.',
        code: 'local hui = gethui()\nlocal screenGui = Instance.new("ScreenGui", hui)'
      },
      {
        name: 'getinstances',
        content: 'Returns a table containing all instances.',
        code: 'local instances = getinstances()\nprint(#instances)'
      },
      {
        name: 'getnilinstances',
        content: 'Returns a table containing all instances parented to nil.',
        code: 'local nils = getnilinstances()\nprint(#nils)'
      }
    ]
  },
  {
    id: 'metatables',
    title: 'Metatables',
    items: [
      {
        name: 'getrawmetatable',
        content: 'Returns the metatable of an object, bypassing the __metatable field.',
        params: 'object (table|userdata) - The target object',
        code: 'local mt = getrawmetatable(game)\nprint(mt)'
      },
      {
        name: 'setrawmetatable',
        content: 'Sets the metatable of an object, bypassing the __metatable field.',
        params: 'object (table|userdata) - The target object\nmt (table) - The new metatable',
        code: 'setrawmetatable(game, {})'
      },
      {
        name: 'setreadonly',
        content: 'Sets the read-only status of a table.',
        params: 't (table) - The target table\nreadonly (boolean) - Whether it should be read-only',
        code: 'local t = {}\nsetreadonly(t, true)\nt.x = 1 -- Errors'
      },
      {
        name: 'isreadonly',
        content: 'Returns whether a table is read-only.',
        params: 't (table) - The target table',
        code: 'print(isreadonly(game))'
      }
    ]
  },
  {
    id: 'script',
    title: 'Script',
    items: [
      {
        name: 'getscriptclosure',
        content: 'Returns a closure representing the script.',
        params: 'script (BaseScript) - The target script',
        code: 'local closure = getscriptclosure(game.Players.LocalPlayer.PlayerScripts.LocalScript)'
      },
      {
        name: 'getscripthash',
        content: 'Returns a unique hash for the script\'s bytecodes.',
        params: 'script (BaseScript) - The target script',
        code: 'print(getscripthash(someScript))'
      }
    ]
  },
  {
    id: 'signals',
    title: 'Signals',
    items: [
      {
        name: 'getconnections',
        content: 'Returns all connections for a signal.',
        params: 'signal (RBXScriptSignal) - The target signal',
        code: 'local connections = getconnections(game.ItemAdded)\nfor _, connection in pairs(connections) do\n    connection:Disable()\nend'
      },
      {
        name: 'signal_connect',
        content: 'Connects a callback to a signal.',
        params: 'signal (Signal) - The target signal\ncallback (function) - The function to call',
        code: 'local connection = signal_connect(someSignal, function() print("Fired!") end)'
      }
    ]
  },
  {
    id: 'websocket',
    title: 'Websocket',
    items: [
      {
        name: 'websocket_connect',
        content: 'Connects to a websocket URL.',
        params: 'url (string) - The websocket URL to connect to.',
        code: 'local ws = websocket_connect("wss://echo.websocket.org")\nws.OnMessage:Connect(function(msg) print(msg) end)\nws:Send("Hello!")'
      }
    ]
  }
];


const LuaEditor: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightLua = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\s+|[(),[\]{}'"]|--.*$)/g);
      return (
        <div key={i} className="flex gap-4">
          <span className="w-6 text-right select-none text-zinc-700 font-mono text-xs">{i + 1}</span>
          <span className="flex-1">
            {parts.map((part, j) => {
              if (part.startsWith('--')) return <span key={j} className="text-zinc-600 italic">{part}</span>;
              if (['local', 'function', 'end', 'for', 'in', 'do', 'if', 'then', 'return', 'pairs', 'ipairs'].includes(part))
                return <span key={j} className="text-[#ad92ff] font-bold">{part}</span>;
              if (/^['"].*['"]$/.test(part)) return <span key={j} className="text-emerald-400">{part}</span>;
              if (/^\d+$/.test(part)) return <span key={j} className="text-orange-400">{part}</span>;
              if (/^[A-Z][a-zA-Z0-9]*$/.test(part)) return <span key={j} className="text-blue-400">{part}</span>;
              return <span key={j} className="text-zinc-300">{part}</span>;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="relative group rounded-3xl overflow-hidden border border-white/[0.05] bg-[#050508] shadow-2xl">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.05] bg-[#08080c]">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
        </div>
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Luau Script</div>
      </div>

      <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre">
        {highlightLua(code)}
      </div>

      <button
        onClick={handleCopy}
        className="absolute top-12 right-6 bg-[#ad92ff] text-[#1a1a2e] px-4 py-2 rounded-xl text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20 flex items-center gap-2"
      >
        {copied ? (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Copy Code
          </>
        )}
      </button>
    </div>
  );
};

export const Docs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(DOC_SECTIONS[0].items[0].name);

  const activeContent = DOC_SECTIONS.flatMap(s => s.items).find(i => i.name === activeTab);

  return (
    <div className="w-full max-w-6xl px-4 pt-48 pb-20 flex flex-col md:flex-row gap-12 animate-in fade-in duration-700">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-32 space-y-8 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
          {DOC_SECTIONS.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 pl-4 sticky top-0 bg-[#000000] py-2 z-10">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === item.name
                      ? 'bg-[#ad92ff] text-[#1a1a2e] shadow-lg shadow-purple-500/10'
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow space-y-8">
        {activeContent && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-5xl font-bold text-white mb-6">{activeContent.name}</h1>
            <div className="bg-[#0d0d14] border border-white/[0.05] p-8 md:p-12 rounded-[40px] shadow-2xl space-y-10">
              <div className="prose prose-invert max-w-none">
                <div className="text-zinc-400 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                  {activeContent.content}
                </div>
              </div>

              {activeContent.params && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Parameters</h3>
                  <div className="text-zinc-300 font-mono text-sm whitespace-pre-wrap">
                    {activeContent.params}
                  </div>
                </div>
              )}

              {activeContent.code && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pl-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ad92ff]" />
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Interactive Code Block</div>
                  </div>
                  <LuaEditor code={activeContent.code} />
                </div>
              )}
            </div>

            <div className="mt-12 flex justify-between gap-4">
              <div className="text-zinc-700 text-xs font-bold uppercase tracking-widest">Avion Documentation / Build v2.4.1 Stable</div>
              <div className="text-zinc-800 text-[10px] font-medium uppercase tracking-tight">Last Refreshed: Nov 2025</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
