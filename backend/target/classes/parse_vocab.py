import re
import json
import os

def parse_vocabulary(file_path):
    vn_blocks = {}
    en_blocks = {}
    
    current_block_type = None # 'VN' or 'EN'
    current_lesson_id = 0
    last_en_lesson_id = 0
    
    # Regex Patterns
    # Headers
    # L1 Contracts
    # Bài 1 Hợp đồng (or just Bài 1)
    
    # English Word Line Pattern (Heuristic)
    # Starts with letters/spaces, then has a POS tag, then definition
    # POS: v, n, adj, adv, prep, conj, a
    # Separator: . or , or just space
    # Look for: space + POS + [.,]? + space
    # And ensuring the POS occurs relatively early? No, "Abide by" is two words.
    
    en_word_pattern = re.compile(r'^[A-Za-z\s\-]+\s+(v|n|adj|adv|prep|conj|a)\b[.?,]*\s+')
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect Header
        # VN Header: "Bài <num>"
        vn_header_match = re.match(r'^Bài\s*(\d+)', line, re.IGNORECASE)
        # EN Header: "L\s*<num>" or "L<num>"
        en_header_match = re.match(r'^L\s*(\d+)', line, re.IGNORECASE)
        
        if vn_header_match:
            current_lesson_id = int(vn_header_match.group(1))
            current_block_type = 'VN'
            if current_lesson_id not in vn_blocks:
                vn_blocks[current_lesson_id] = {'name': line, 'lines': []}
            continue
            
        if en_header_match:
            current_lesson_id = int(en_header_match.group(1))
            current_block_type = 'EN'
            last_en_lesson_id = current_lesson_id
            if current_lesson_id not in en_blocks:
                 # Extract name after L<num>
                 topic_name = line[len(en_header_match.group(0)):].strip()
                 en_blocks[current_lesson_id] = {'name': topic_name, 'lines': []}
            continue
            
        # Content Line Processing
        # Check if it matches English Word Pattern
        if en_word_pattern.match(line):
             # Force assignment to EN block
             # Use last_en_lesson_id (handles displaced blocks)
             if last_en_lesson_id > 0:
                 if last_en_lesson_id not in en_blocks:
                      en_blocks[last_en_lesson_id] = {'name': f"Lesson {last_en_lesson_id}", 'lines': []}
                 en_blocks[last_en_lesson_id]['lines'].append(line)
             continue
        
        # Otherwise, assign based on current block type
        if current_block_type == 'VN':
            if current_lesson_id in vn_blocks:
                vn_blocks[current_lesson_id]['lines'].append(line)
        elif current_block_type == 'EN':
            if current_lesson_id in en_blocks:
                en_blocks[current_lesson_id]['lines'].append(line)

    # Now process the blocks and merge
    final_data = []
    
    # We iterate through EN blocks as the primary driver
    sorted_lessons = sorted(en_blocks.keys())
    
    for lesson_id in sorted_lessons:
        en_data = en_blocks[lesson_id]
        vn_data = vn_blocks.get(lesson_id, {'lines': []})
        
        topic_obj = {
            "name": en_data['name'],
            "book": "600 Essential Words For The TOEIC",
            "words": []
        }
        
        # Process English Words
        current_word = None
        
        for line in en_data['lines']:
            # Parse line: "Word POS definition"
            # Regex: look for POS marker
            match = re.search(r'\s+(v\.|n\.|adj\.|adv\.|prep\.|conj\.|v|n|adj|adv|a)\b[.?,]*\s+', line)
            
            if match:
                # It has a POS marker.
                # Heuristic:
                # Main Entry usually has a definition that explains the word.
                # Word Form line usually just lists derivatives like "Word adj."
                
                # Split word and definition
                split_idx = match.start()
                word_part = line[:split_idx].strip()
                result_part = line[split_idx:].strip() # includes "v. definition..."

                # Check for definition indicators in result_part
                # - Starts with "to " (verbs)
                # - Starts with "a ", "an ", "the " (nouns)
                # - Long text
                
                pos_markers = re.findall(r'\b(v\.|n\.|adj\.|adv\.|v|n|adj|adv|a)\b[.?,]?', result_part)
                
                pass_is_word_form = False
                
                has_definition_keywords = re.search(r'\b(to|a|an|the|of|or)\b', result_part, re.IGNORECASE)
                
                if len(pos_markers) >= 1 and not has_definition_keywords and len(result_part) < 50:
                     # Likely word forms
                     pass_is_word_form = True
                
                if current_word:
                     # Check if new word is completely different?
                     if len(word_part) > 0 and len(current_word['english']) > 0:
                        if word_part[0].lower() != current_word['english'][0].lower():
                            pass_is_word_form = False # Force new word
                
                if pass_is_word_form and current_word:
                    current_word['wordForms'] = line
                else:
                    # New Word
                    current_word = {
                        "english": word_part,
                        "vietnamese": "", # Will fill later
                        "meaning": result_part,
                        "wordForms": "",
                        "pronunciation": ""
                    }
                    topic_obj["words"].append(current_word)
            else:
                 # No POS marker? Append to meaning of previous word?
                 if current_word:
                     current_word['meaning'] += " " + line
        
        # Process Vietnamese Meanings
        # Simple heuristic: map linearly? or try to match?
        # The VN lists seem to just list meanings line by line.
        # "Tuân theo, chịu theo"
        # "Sự thoả thuận"
        # Since we extracted N english words, and have M Vietnamese lines...
        # Hopefully N ~= M?
        # Often VN list skips word forms.
        
        vn_lines = [l for l in vn_data['lines'] if not l.isdigit()] # Remove page numbers "3", "4"
        
        # Clean vn lines
        clean_vn_lines = []
        for l in vn_lines:
             if l.strip():
                 clean_vn_lines.append(l.strip())
        
        # Assign to words
        # We only assign to MAIN entries.
        # But wait, did we successfully identify main entries vs word forms?
        # If yes, we can try to zip.
        
        word_idx = 0
        vn_idx = 0
        
        while word_idx < len(topic_obj['words']) and vn_idx < len(clean_vn_lines):
            topic_obj['words'][word_idx]['vietnamese'] = clean_vn_lines[vn_idx]
            word_idx += 1
            vn_idx += 1
            
        final_data.append(topic_obj)
        
    return final_data

if __name__ == '__main__':
    result = parse_vocabulary('backend/src/main/resources/raw_vocab.txt')
    with open('backend/src/main/resources/vocab.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"Parsed {len(result)} topics.")
