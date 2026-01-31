#!/usr/bin/env python3
"""
CV Intelligence Phase 2 & Phase 3 API Tests
Tests the NEW interview and learning roadmap endpoints as specified in the review request
"""

import requests
import sys
import json
from datetime import datetime

class CVIntelligenceTester:
    def __init__(self, base_url="https://app-status-check-21.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.cv_id = None
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                except:
                    print("   Response: Non-JSON or empty")
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "Empty response"
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Timeout after {timeout}s")
            self.failed_tests.append({"test": name, "error": "Timeout"})
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({"test": name, "error": str(e)})
            return False, {}

    def run_test_with_files(self, name, method, endpoint, expected_status, files=None, data=None, timeout=30):
        """Run a test with file upload support"""
        url = f"{self.base_url}/api/{endpoint}"
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'POST' and files:
                response = requests.post(url, files=files, data=data, timeout=timeout)
            elif method == 'GET':
                response = requests.get(url, timeout=timeout)
            elif method == 'POST':
                headers = {'Content-Type': 'application/json'}
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            else:
                response = requests.request(method, url, json=data, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                except:
                    print("   Response: Non-JSON or empty")
            else:
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "Empty response"
                })
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Timeout after {timeout}s")
            self.failed_tests.append({"test": name, "error": "Timeout"})
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({"test": name, "error": str(e)})
            return False, {}

    def create_test_cv_file(self):
        """Create a test CV file as specified in the review request"""
        cv_content = """John Doe
john.doe@email.com | +1234567890

SUMMARY
Experienced software engineer with 5 years of experience in Python and JavaScript.

EXPERIENCE
Senior Developer at TechCorp (2020-Present)
- Built scalable APIs using FastAPI
- Led team of 3 engineers

EDUCATION
BS Computer Science, State University (2018)

SKILLS
Python, JavaScript, React, FastAPI, PostgreSQL"""
        return cv_content.encode('utf-8')

    def test_cv_upload(self):
        """Test CV upload (prerequisite for other tests)"""
        try:
            cv_data = self.create_test_cv_file()
            files = {'file': ('test_cv.txt', cv_data, 'text/plain')}
            
            success, response = self.run_test_with_files("CV Upload (Prerequisite)", "POST", "cv/upload", 200, files=files, timeout=60)
            
            if success and response:
                self.cv_id = response.get('cv_id')
                print(f"   ✓ CV ID stored: {self.cv_id}")
                return True, response
            
            return success, response
            
        except Exception as e:
            print(f"❌ CV Upload Failed - Error: {str(e)}")
            self.failed_tests.append({"test": "CV Upload", "error": str(e)})
            return False, {}

    def test_cv_interview_generate(self):
        """Test interview question generation API"""
        if not self.cv_id:
            print("❌ Skipping interview generation test - no cv_id available")
            return False, {}
        
        data = {
            "cv_id": self.cv_id,
            "target_role": "Senior Software Engineer",
            "company_name": "Google",
            "stage": "all",
            "num_questions": 3
        }
        
        success, response = self.run_test("CV Interview Generate", "POST", "cv/interview/generate", 200, data, timeout=90)
        
        if success and response:
            self.session_id = response.get('session_id')
            expected_keys = ["session_id", "cv_id", "target_role", "company_name", "current_stage", "questions", "answers"]
            if all(key in response for key in expected_keys):
                questions = response.get('questions', [])
                print(f"   ✓ Session ID: {response.get('session_id', 'N/A')}")
                print(f"   ✓ Target role: {response.get('target_role', 'N/A')}")
                print(f"   ✓ Company: {response.get('company_name', 'N/A')}")
                print(f"   ✓ Questions generated: {len(questions)}")
                
                # Check question structure
                if questions:
                    first_question = questions[0]
                    expected_q_keys = ["id", "stage", "question", "question_type", "expected_topics", "difficulty", "time_limit_seconds"]
                    if all(key in first_question for key in expected_q_keys):
                        print(f"   ✓ Question structure valid")
                        print(f"   ✓ First question stage: {first_question.get('stage', 'N/A')}")
                        print(f"   ✓ Question type: {first_question.get('question_type', 'N/A')}")
                        print(f"   ✓ Difficulty: {first_question.get('difficulty', 'N/A')}")
                        
                        # Check if questions reference CV content
                        question_text = first_question.get('question', '').lower()
                        cv_keywords = ['fastapi', 'postgresql', 'team', 'leadership', 'python', 'javascript']
                        found_keywords = [kw for kw in cv_keywords if kw in question_text]
                        if found_keywords:
                            print(f"   ✓ Questions reference CV content: {found_keywords}")
                        else:
                            print(f"   ⚠️ Questions may not reference CV content")
                    else:
                        print(f"   ⚠️ Question structure incomplete")
                
                return True, response
            else:
                print(f"   ⚠️ Missing expected response keys")
        
        return success, response

    def test_cv_interview_get_session(self):
        """Test getting interview session"""
        if not self.session_id:
            print("❌ Skipping interview session get test - no session_id available")
            return False, {}
        
        url = f"cv/interview/{self.session_id}"
        success, response = self.run_test("Get Interview Session", "GET", url, 200, timeout=30)
        
        if success and response:
            expected_keys = ["session_id", "cv_id", "target_role", "company_name", "questions", "answers"]
            if all(key in response for key in expected_keys):
                print(f"   ✓ Session retrieved: {response.get('session_id', 'N/A')}")
                print(f"   ✓ Questions in session: {len(response.get('questions', []))}")
                print(f"   ✓ Answers recorded: {len(response.get('answers', []))}")
                return True, response
            else:
                print(f"   ⚠️ Missing expected response keys")
        
        return success, response

    def test_cv_interview_evaluate(self):
        """Test evaluating an interview answer"""
        if not self.session_id:
            print("❌ Skipping interview evaluation test - no session_id available")
            return False, {}
        
        # First get the session to find a question_id
        session_response = self.run_test("Get Session for Evaluation", "GET", f"cv/interview/{self.session_id}", 200, timeout=30)
        if not session_response[0] or not session_response[1]:
            print("❌ Could not retrieve session for evaluation")
            return False, {}
        
        questions = session_response[1].get('questions', [])
        if not questions:
            print("❌ No questions found in session")
            return False, {}
        
        # Use the first question for testing
        question_id = questions[0].get('id')
        
        data = {
            "session_id": self.session_id,
            "question_id": question_id,
            "answer_text": "In my current role at TechCorp, I led a team of 3 engineers building scalable APIs. We used FastAPI and PostgreSQL to handle over 10,000 requests per second. I enjoy collaborative environments and focus on mentoring junior developers.",
            "time_taken_seconds": 90
        }
        
        success, response = self.run_test("CV Interview Evaluate", "POST", "cv/interview/evaluate", 200, data, timeout=90)
        
        if success and response:
            expected_keys = ["question_id", "score", "clarity_score", "structure_score", "confidence_score", "relevance_score", "feedback", "strengths", "improvements", "model_answer"]
            if all(key in response for key in expected_keys):
                score = response.get('score', 0)
                clarity_score = response.get('clarity_score', 0)
                strengths = response.get('strengths', [])
                improvements = response.get('improvements', [])
                
                print(f"   ✓ Overall score: {score}/100")
                print(f"   ✓ Clarity score: {clarity_score}/100")
                print(f"   ✓ Strengths identified: {len(strengths)}")
                print(f"   ✓ Improvements suggested: {len(improvements)}")
                
                # Check if scores are reasonable (50-85% for a decent answer)
                if 40 <= score <= 95:
                    print(f"   ✓ Reasonable score range")
                else:
                    print(f"   ⚠️ Score may be unrealistic: {score}")
                
                # Check if model answer is provided
                model_answer = response.get('model_answer', '')
                if len(model_answer) > 50:
                    print(f"   ✓ Model answer provided ({len(model_answer)} chars)")
                else:
                    print(f"   ⚠️ Model answer seems too brief")
                
                return True, response
            else:
                print(f"   ⚠️ Missing expected response keys")
        
        return success, response

    def test_cv_interview_if_i_were_you(self):
        """Test 'If I Were You' model answer generation"""
        if not self.cv_id:
            print("❌ Skipping 'If I Were You' test - no cv_id available")
            return False, {}
        
        data = {
            "cv_id": self.cv_id,
            "question": "Tell me about a time you had to deal with a difficult team member"
        }
        
        success, response = self.run_test("CV Interview If I Were You", "POST", "cv/interview/if-i-were-you", 200, data, timeout=60)
        
        if success and response:
            expected_keys = ["model_answer", "key_points", "structure_used", "honest_gaps", "tips"]
            if all(key in response for key in expected_keys):
                model_answer = response.get('model_answer', '')
                key_points = response.get('key_points', [])
                honest_gaps = response.get('honest_gaps', [])
                tips = response.get('tips', [])
                
                print(f"   ✓ Model answer length: {len(model_answer)} chars")
                print(f"   ✓ Key points: {len(key_points)}")
                print(f"   ✓ Honest gaps: {len(honest_gaps)}")
                print(f"   ✓ Tips provided: {len(tips)}")
                
                # Check if answer uses only CV information (should not fabricate)
                cv_keywords = ['techcorp', 'fastapi', 'postgresql', 'team', 'engineer']
                found_cv_refs = sum(1 for kw in cv_keywords if kw.lower() in model_answer.lower())
                if found_cv_refs > 0:
                    print(f"   ✓ Answer references CV content ({found_cv_refs} keywords)")
                else:
                    print(f"   ⚠️ Answer may not be based on CV content")
                
                return True, response
            else:
                print(f"   ⚠️ Missing expected response keys")
        
        return success, response

    def test_cv_interview_session_summary(self):
        """Test getting interview session summary"""
        if not self.session_id:
            print("❌ Skipping session summary test - no session_id available")
            return False, {}
        
        # Use form data as the endpoint expects
        url = f"{self.base_url}/api/cv/interview/session-summary"
        
        self.tests_run += 1
        print(f"\n🔍 Testing Interview Session Summary...")
        print(f"   URL: {url}")
        
        try:
            form_data = {
                'session_id': self.session_id
            }
            
            response = requests.post(url, data=form_data, timeout=60)
            
            success = response.status_code == 200
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    expected_keys = ["session_id", "total_questions", "answered_questions", "overall_score", "summary"]
                    if all(key in response_data for key in expected_keys):
                        print(f"   ✓ Session ID: {response_data.get('session_id', 'N/A')}")
                        print(f"   ✓ Total questions: {response_data.get('total_questions', 0)}")
                        print(f"   ✓ Answered questions: {response_data.get('answered_questions', 0)}")
                        print(f"   ✓ Overall score: {response_data.get('overall_score', 0)}")
                        
                        summary = response_data.get('summary', '')
                        if len(summary) > 50:
                            print(f"   ✓ Summary provided ({len(summary)} chars)")
                        else:
                            print(f"   ⚠️ Summary seems too brief")
                        
                        return True, response_data
                    else:
                        print(f"   ⚠️ Missing expected response keys")
                        print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                except:
                    print("   Response: Non-JSON or empty")
            else:
                self.failed_tests.append({
                    "test": "Interview Session Summary",
                    "expected": 200,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "Empty response"
                })
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Timeout after 60s")
            self.failed_tests.append({"test": "Interview Session Summary", "error": "Timeout"})
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({"test": "Interview Session Summary", "error": str(e)})
            return False, {}

    def test_cv_learning_roadmap(self):
        """Test learning roadmap generation API (Phase 3)"""
        if not self.cv_id:
            print("❌ Skipping learning roadmap test - no cv_id available")
            return False, {}
        
        data = {
            "cv_id": self.cv_id,
            "target_role": "Senior Software Engineer",
            "timeframe_days": 14
        }
        
        success, response = self.run_test("CV Learning Roadmap", "POST", "cv/learning-roadmap", 200, data, timeout=90)
        
        if success and response:
            expected_keys = ["timeframe_days", "daily_plan", "key_skills_to_learn", "resources", "interview_focus_areas", "practice_questions"]
            if all(key in response for key in expected_keys):
                timeframe = response.get('timeframe_days', 0)
                daily_plan = response.get('daily_plan', [])
                key_skills = response.get('key_skills_to_learn', [])
                resources = response.get('resources', [])
                focus_areas = response.get('interview_focus_areas', [])
                practice_questions = response.get('practice_questions', [])
                
                print(f"   ✓ Timeframe: {timeframe} days")
                print(f"   ✓ Daily plan items: {len(daily_plan)}")
                print(f"   ✓ Key skills to learn: {len(key_skills)}")
                print(f"   ✓ Resources provided: {len(resources)}")
                print(f"   ✓ Interview focus areas: {len(focus_areas)}")
                print(f"   ✓ Practice questions: {len(practice_questions)}")
                
                # Check daily plan structure
                if daily_plan:
                    first_day = daily_plan[0]
                    expected_day_keys = ["day", "focus", "tasks", "time_hours", "milestones"]
                    if all(key in first_day for key in expected_day_keys):
                        print(f"   ✓ Daily plan structure valid")
                        print(f"   ✓ Day 1 focus: {first_day.get('focus', 'N/A')}")
                        print(f"   ✓ Day 1 tasks: {len(first_day.get('tasks', []))}")
                        print(f"   ✓ Day 1 time: {first_day.get('time_hours', 0)} hours")
                    else:
                        print(f"   ⚠️ Daily plan structure incomplete")
                
                # Check if roadmap is realistic for 14 days
                if timeframe == 14 and len(daily_plan) <= 14:
                    print(f"   ✓ Realistic 14-day roadmap")
                else:
                    print(f"   ⚠️ Roadmap may not match requested timeframe")
                
                return True, response
            else:
                print(f"   ⚠️ Missing expected response keys")
        
        return success, response

    def run_all_tests(self):
        """Run all CV Intelligence Phase 2 & Phase 3 tests"""
        print(f"🚀 Starting CV Intelligence Phase 2 & Phase 3 API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

        # Test sequence - must follow this order due to dependencies
        tests = [
            self.test_cv_upload,  # Prerequisite - creates CV
            self.test_cv_interview_generate,  # Phase 2 - creates interview session
            self.test_cv_interview_get_session,  # Phase 2 - retrieves session
            self.test_cv_interview_evaluate,  # Phase 2 - evaluates answer
            self.test_cv_interview_if_i_were_you,  # Phase 2 - model answer
            self.test_cv_interview_session_summary,  # Phase 2 - session summary
            self.test_cv_learning_roadmap,  # Phase 3 - learning roadmap
        ]

        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test failed with exception: {str(e)}")
                self.failed_tests.append({"test": test.__name__, "error": str(e)})

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 CV Intelligence Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"   • {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = CVIntelligenceTester()
    
    # Check if we can reach the base URL
    try:
        response = requests.get(tester.base_url, timeout=10)
        print(f"✅ Base URL reachable: {tester.base_url}")
    except Exception as e:
        print(f"❌ Cannot reach base URL {tester.base_url}: {str(e)}")
        return 1
    
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())