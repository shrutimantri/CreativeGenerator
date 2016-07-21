#!/usr/bin/env python

# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START imports]
import os
import urllib

from google.appengine.api import users
from google.appengine.ext import ndb

import jinja2
import webapp2
import pdb

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)
# [END imports]

import re, collections

synonyms = { 'Below': 'Under',
                 'Over': 'Above'
}

errorStrings = {
    'Rs. ': 'No space after Rs.',
    'RS.': 'No caps in Rs.',
    '&': 'No & allowed in creative',
    "?": 'No ? allowed in creative',
}

warningStrings = {
    'and more': 'Do not use "and more" in string'
}

brandsDict = [
    'Puma',
    'Adidas',
    'Biba',
    'Eveready'
]


#def words(text): return re.findall('[a-z]+', text.lower())
def words(text): return re.findall('[a-zA-Z]+', text)

def tokens(text): return text.split(" ")

NWORDS = words(file('words.txt').read())

alphabet = 'abcdefghijklmnopqrstuvwxyz'

def edits1(word):
   splits     = [(word[:i], word[i:]) for i in range(len(word) + 1)]
   deletes    = [a + b[1:] for a, b in splits if b]
   transposes = [a + b[1] + b[0] + b[2:] for a, b in splits if len(b)>1]
   replaces   = [a + c + b[1:] for a, b in splits for c in alphabet if b]
   inserts    = [a + c + b     for a, b in splits for c in alphabet]
   return set(deletes + transposes + replaces + inserts)

def known_edits2(word):
    return set(e2 for e1 in edits1(word) for e2 in edits1(e1) if e2 in NWORDS)

def known(words): return set(w for w in words if w in NWORDS)

def correct(word):
    candidates = known([word]) or known(edits1(word)) or known_edits2(word) or [word]
    return max(candidates, key=NWORDS.get)

def fkreatives(input_string):
    return input_string

def findErrors(text):
    creativeErrors = []
    for errorString in errorStrings.keys():
        if text.find(errorString) != -1:
            creativeErrors.append({'Error': "Copy Error: " + errorStrings[errorString]})
    return creativeErrors

def findSynonyms(text):
    creativeErrors = []
    textTokens = tokens(text)
    for tok in textTokens:
        if tok in synonyms.keys():
            creativeErrors.append({'Warning': "Synonym: Consider using \"" + synonyms[tok] + "\" instead of \"" + tok + "\""})
    return creativeErrors

def findNotWords(text):
    creativeErrors = []
    textTokens = words(text)
    for tok in textTokens:
        if tok.lower() not in NWORDS:
            creativeErrors.append({'Error': "Not a Word: \"" + tok + "\" is not a valid word"})
    return creativeErrors



# [START main_page]
class MainPage(webapp2.RequestHandler):

    def get(self):
        content = self.request.get('content')

        creativeErrors = findErrors(content)
        creativeErrors += findNotWords(content)
        creativeErrors += findSynonyms(content)
        template_values = {
            'creativeErrors': creativeErrors,
            'content': content
        }

        template = JINJA_ENVIRONMENT.get_template('index.html')
        self.response.write(template.render(template_values))
# [END main_page]

# [START main_page]
class CreativePage(webapp2.RequestHandler):

    def get(self):
        template = JINJA_ENVIRONMENT.get_template('creative.html')
        self.response.write(template.render())
# [END main_page]


# [START guestbook]
class CreativeCompiler(webapp2.RequestHandler):

    def post(self):
        # We set the same parent key on the 'Greeting' to ensure each
        # Greeting is in the same entity group. Queries across the
        # single entity group will be consistent. However, the write
        # rate to a single entity group should be limited to
        # ~1/second.
        content = self.request.get('content')
        print content
        query_params = {'content': content}
        self.redirect('/?' + urllib.urlencode(query_params))
# [END guestbook]


# [START app]
app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/creatives', CreativePage),
    ('/compile', CreativeCompiler),
], debug=True)
# [END app]
